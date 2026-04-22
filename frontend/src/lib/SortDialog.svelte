<script lang="ts">
    import { Constants } from '../Constants';
    import { sortedTagFiles, fetchTags } from '../stores/tags';
    import { apiPost } from '../utils';
    import { get } from 'svelte/store';
    import type { TagFile, TagCategory, TagItem } from '../types';

    type DragInfo =
        | { type: 'file'; fileId: string }
        | { type: 'category'; fileId: string; categoryId: string }
        | { type: 'item'; fileId: string; categoryId: string; name: string };

    // ドラッグ中のライブ並び替え結果（drop までは API 未送信）
    type WorkingOrder =
        | { type: 'file'; sort: string[] }
        | { type: 'category'; fileId: string; sort: string[] }
        | { type: 'item'; fileId: string; categoryId: string; sort: string[] };

    // 編集ダイアログ呼び出し用のハンドラ（親の PromptSelector から注入）
    export let onEditCategory: (fileId: string, categoryId: string) => void = () => {};
    export let onEditItem: (
        fileId: string,
        categoryId: string,
        name: string,
        prompt: string
    ) => void = () => {};

    let dialog: HTMLDialogElement;

    // ツリー開閉状態（セッション内で維持、ダイアログを開く度にリセット）
    let expandedFiles = new Set<string>();
    let expandedCategories = new Set<string>(); // key: `${fileId}::${categoryId}`

    // DnD 状態
    let dragging: DragInfo | null = null;
    let workingOrder: WorkingOrder | null = null;

    // ---- 公開メソッド ----
    export function open() {
        expandedFiles = new Set();
        expandedCategories = new Set();
        dragging = null;
        workingOrder = null;
        dialog.showModal();
    }

    function close() {
        dialog.close();
    }

    function toggleFile(fileId: string) {
        if (expandedFiles.has(fileId)) {
            expandedFiles.delete(fileId);
        } else {
            expandedFiles.add(fileId);
        }
        expandedFiles = expandedFiles;
    }

    function toggleCategory(fileId: string, categoryId: string) {
        const key = `${fileId}::${categoryId}`;
        if (expandedCategories.has(key)) {
            expandedCategories.delete(key);
        } else {
            expandedCategories.add(key);
        }
        expandedCategories = expandedCategories;
    }

    // ---- DnD ----

    function fileKey(fileId: string) {
        return `file::${fileId}`;
    }
    function categoryKey(fileId: string, categoryId: string) {
        return `cat::${fileId}::${categoryId}`;
    }
    function itemKey(fileId: string, categoryId: string, name: string) {
        return `item::${fileId}::${categoryId}::${name}`;
    }

    // DragInfo ファクトリ（`{@const}` 内で `as const` を使わずに済ませるため）
    function makeFileInfo(fileId: string): DragInfo {
        return { type: 'file', fileId };
    }
    function makeCategoryInfo(fileId: string, categoryId: string): DragInfo {
        return { type: 'category', fileId, categoryId };
    }
    function makeItemInfo(fileId: string, categoryId: string, name: string): DragInfo {
        return { type: 'item', fileId, categoryId, name };
    }

    function keyOf(info: DragInfo): string {
        if (info.type === 'file') return fileKey(info.fileId);
        if (info.type === 'category') return categoryKey(info.fileId, info.categoryId);
        return itemKey(info.fileId, info.categoryId, info.name);
    }

    function isSameHierarchy(target: DragInfo): boolean {
        if (!dragging || dragging.type !== target.type) return false;
        if (dragging.type === 'file') return true;
        if (dragging.type === 'category' && target.type === 'category') {
            return target.fileId === dragging.fileId;
        }
        if (dragging.type === 'item' && target.type === 'item') {
            return target.fileId === dragging.fileId && target.categoryId === dragging.categoryId;
        }
        return false;
    }

    // ---- 表示順：workingOrder があれば優先、無ければ store の順序 ----
    // 第2引数で workingOrder を受け取るのは Svelte 4 の反応性を効かせるため
    // （関数内でしか読まれない let は template からの依存として検出されない）

    function displayedFiles(files: TagFile[], wo: WorkingOrder | null): TagFile[] {
        if (wo?.type !== 'file') return files;
        const order = wo.sort;
        return [...files].sort((a, b) => order.indexOf(a.fileId) - order.indexOf(b.fileId));
    }

    function displayedCategories(file: TagFile, wo: WorkingOrder | null): TagCategory[] {
        if (wo?.type !== 'category' || wo.fileId !== file.fileId) {
            return file.categories;
        }
        const order = wo.sort;
        return [...file.categories].sort((a, b) => order.indexOf(a.categoryId) - order.indexOf(b.categoryId));
    }

    function displayedItems(file: TagFile, category: TagCategory, wo: WorkingOrder | null): TagItem[] {
        if (wo?.type !== 'item' || wo.fileId !== file.fileId || wo.categoryId !== category.categoryId) {
            return category.items;
        }
        const order = wo.sort;
        return [...category.items].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }

    // ---- 現在の表示順を取得（workingOrder 優先） ----

    function currentFileOrder(): string[] {
        if (workingOrder?.type === 'file') return workingOrder.sort;
        return get(sortedTagFiles).map((f) => f.fileId);
    }

    function currentCategoryOrder(fileId: string): string[] {
        if (workingOrder?.type === 'category' && workingOrder.fileId === fileId) {
            return workingOrder.sort;
        }
        const file = get(sortedTagFiles).find((f) => f.fileId === fileId);
        return file ? file.categories.map((c) => c.categoryId) : [];
    }

    function currentItemOrder(fileId: string, categoryId: string): string[] {
        if (workingOrder?.type === 'item' && workingOrder.fileId === fileId && workingOrder.categoryId === categoryId) {
            return workingOrder.sort;
        }
        const file = get(sortedTagFiles).find((f) => f.fileId === fileId);
        const cat = file?.categories.find((c) => c.categoryId === categoryId);
        return cat ? cat.items.map((i) => i.name) : [];
    }

    // ---- DnD ハンドラ ----

    // 診断用：dragover ログのスパムを防ぐため、直前ログと同じものは出さない
    let lastDragoverLogKey = '';
    // 診断用：drop が発火したかを dragend で確認できるようにする
    let dropFired = false;

    function handleDragStart(info: DragInfo, e: DragEvent) {
        console.log('[D2PS-Sort] dragstart on handle', { info });
        dropFired = false;
        lastDragoverLogKey = '';
        dragging = info;
        workingOrder = null;
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', keyOf(info));
            // drag image に行全体を使うことで見た目を自然にする
            const handle = e.currentTarget as HTMLElement;
            const row = handle.closest('.d2ps-sort-row') as HTMLElement | null;
            if (row) {
                const rect = row.getBoundingClientRect();
                e.dataTransfer.setDragImage(row, e.clientX - rect.left, e.clientY - rect.top);
            }
        }
    }

    function handleDragEnd() {
        console.log('[D2PS-Sort] dragend', { dragging, workingOrder, dropFired });
        // drop が発火していれば dragging は既に null のはず。
        // dragging が残っている＝ キャンセル（ESC や無効な場所へのドロップ）と判定して戻す。
        if (dragging) {
            console.log('[D2PS-Sort] dragend: cancelling (drop never fired), revert live reorder');
            dragging = null;
            workingOrder = null;
        }
    }

    function computePosition(e: DragEvent, el: HTMLElement): 'before' | 'after' {
        const rect = el.getBoundingClientRect();
        return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    }

    /** 配列内で from を to の前後に移動した新配列を返す */
    function reorderArray<T>(arr: T[], from: T, to: T, position: 'before' | 'after'): T[] {
        if (from === to) return arr.slice();
        const next = arr.filter((x) => x !== from);
        const targetIdx = next.indexOf(to);
        if (targetIdx === -1) return arr.slice();
        const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;
        next.splice(insertIdx, 0, from);
        return next;
    }

    function arraysEqual(a: string[], b: string[]): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }

    function handleDragOver(target: DragInfo, e: DragEvent) {
        if (!dragging) return;
        const sameHier = isSameHierarchy(target);
        // ターゲットが変わった時のみログ（60fps のスパム防止）
        const logKey = `${keyOf(target)}|${sameHier}`;
        if (logKey !== lastDragoverLogKey) {
            console.log('[D2PS-Sort] dragover target', {
                targetType: target.type,
                sameHier,
                target,
            });
            lastDragoverLogKey = logKey;
        }
        // ドラッグ中はどの行でも drop 発火を許可する（ライブ並び替えで DOM が動き、
        // 離した瞬間にカーソルが別階層の子孫行上に来ても drop を取りこぼさないため）
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        // workingOrder の更新は同階層のときのみ。別階層なら「最後に有効だった順序」を保持
        if (!sameHier) return;
        const el = e.currentTarget as HTMLElement;
        const position = computePosition(e, el);

        // ライブ並び替え：現在の表示順を基に新しい並びを計算して workingOrder に反映
        if (dragging.type === 'file' && target.type === 'file') {
            const current = currentFileOrder();
            const next = reorderArray(current, dragging.fileId, target.fileId, position);
            if (!arraysEqual(current, next)) {
                workingOrder = { type: 'file', sort: next };
                console.log('[D2PS-Sort] workingOrder updated (file)', next);
            }
        } else if (dragging.type === 'category' && target.type === 'category') {
            const current = currentCategoryOrder(dragging.fileId);
            const next = reorderArray(current, dragging.categoryId, target.categoryId, position);
            if (!arraysEqual(current, next)) {
                workingOrder = { type: 'category', fileId: dragging.fileId, sort: next };
                console.log('[D2PS-Sort] workingOrder updated (category)', next);
            }
        } else if (dragging.type === 'item' && target.type === 'item') {
            const current = currentItemOrder(dragging.fileId, dragging.categoryId);
            const next = reorderArray(current, dragging.name, target.name, position);
            if (!arraysEqual(current, next)) {
                workingOrder = {
                    type: 'item',
                    fileId: dragging.fileId,
                    categoryId: dragging.categoryId,
                    sort: next,
                };
                console.log('[D2PS-Sort] workingOrder updated (item)', next);
            }
        }
    }

    async function handleDrop(target: DragInfo, e: DragEvent) {
        dropFired = true;
        console.log('[D2PS-Sort] drop fired', {
            dragging,
            target,
            workingOrder,
            sameHier: dragging ? isSameHierarchy(target) : null,
        });
        // 別階層の行で drop してもよい：workingOrder が既にあればコミットする
        if (!dragging) {
            console.log('[D2PS-Sort] drop: ignored (no dragging)');
            return;
        }
        e.preventDefault();

        const order = workingOrder; // 確定スナップショット
        dragging = null;

        // 位置が変わっていなければ API は呼ばない
        if (!order) {
            console.log('[D2PS-Sort] drop: no workingOrder, nothing to save');
            workingOrder = null;
            return;
        }

        try {
            let res: any = null;
            if (order.type === 'file') {
                console.log('[D2PS-Sort] POST /reorder_files', order.sort);
                res = await apiPost('/reorder_files', { sort: order.sort });
            } else if (order.type === 'category') {
                console.log('[D2PS-Sort] POST /reorder_categories', {
                    file: order.fileId,
                    sort: order.sort,
                });
                res = await apiPost('/reorder_categories', {
                    file: order.fileId,
                    sort: order.sort,
                });
            } else if (order.type === 'item') {
                console.log('[D2PS-Sort] POST /reorder_items', {
                    file: order.fileId,
                    category: order.categoryId,
                    sort: order.sort,
                });
                res = await apiPost('/reorder_items', {
                    file: order.fileId,
                    category: order.categoryId,
                    sort: order.sort,
                });
            }
            console.log('[D2PS-Sort] API response', res);
            await fetchTags();
            console.log('[D2PS-Sort] fetchTags done');
        } catch (err) {
            console.error('[D2PS-Sort] reorder failed', err);
            await fetchTags();
        } finally {
            // fetchTags 後にクリアすることで、store 反映までの間に順序が戻ってちらつくのを防ぐ
            workingOrder = null;
        }
    }

    /** 行がドラッグ中の対象 or その子孫であれば true */
    function isDragAffected(info: DragInfo, d: DragInfo | null): boolean {
        if (!d) return false;
        if (d.type === 'file') {
            // ファイルをドラッグ中 → そのファイル自身・配下カテゴリ・配下アイテム全て
            return info.fileId === d.fileId;
        }
        if (d.type === 'category') {
            // カテゴリをドラッグ中 → そのカテゴリ自身と配下のアイテム
            if (info.type === 'file') return false;
            return info.fileId === d.fileId && info.categoryId === d.categoryId;
        }
        // d.type === 'item'
        if (info.type !== 'item') return false;
        return info.fileId === d.fileId && info.categoryId === d.categoryId && info.name === d.name;
    }

    // 第3引数で dragging を受け取るのは Svelte 4 の反応性を効かせるため
    function rowClasses(info: DragInfo, base: string, d: DragInfo | null): string {
        const classes = [base];
        if (isDragAffected(info, d)) {
            classes.push('d2ps-sort-row--dragging');
        }
        return classes.join(' ');
    }
</script>

<dialog class="d2ps-dialog-root" bind:this={dialog}>
    <div class="d2ps-dialog d2ps-dialog--sort">
        <h3 class="d2ps-dialog__title">並び順</h3>

        <div class="d2ps-sort-tree text-sm font-inter font-light">
            {#each displayedFiles($sortedTagFiles, workingOrder) as file (file.fileId)}
                {@const fileInfo = makeFileInfo(file.fileId)}
                <!-- ファイル行 -->
                <div
                    class={rowClasses(fileInfo, 'd2ps-sort-row d2ps-sort-row--file', dragging)}
                    role="listitem"
                    on:dragover={(e) => handleDragOver(fileInfo, e)}
                    on:drop={(e) => handleDrop(fileInfo, e)}
                >
                    <button
                        class="d2ps-sort-row__toggle"
                        on:click={() => toggleFile(file.fileId)}
                        aria-label={expandedFiles.has(file.fileId) ? '折り畳み' : '展開'}
                    >
                        {expandedFiles.has(file.fileId) ? '▼' : '▶'}
                    </button>
                    <span class="d2ps-sort-row__label">{file.fileId}</span>
                    <span class="d2ps-sort-row__close">x</span>
                    <span
                        class="d2ps-sort-row__drag-handle drag-handle w-3"
                        role="button"
                        tabindex="-1"
                        aria-label="ドラッグして並び替え"
                        draggable="true"
                        on:dragstart={(e) => handleDragStart(fileInfo, e)}
                        on:dragend={handleDragEnd}
                    ></span>
                </div>

                {#if expandedFiles.has(file.fileId)}
                    {#each displayedCategories(file, workingOrder) as category (category.categoryId)}
                        {@const catKey = `${file.fileId}::${category.categoryId}`}
                        {@const catInfo = makeCategoryInfo(file.fileId, category.categoryId)}
                        <!-- カテゴリ行 -->
                        <div
                            class={rowClasses(catInfo, 'd2ps-sort-row d2ps-sort-row--category', dragging)}
                            role="listitem"
                            on:dragover={(e) => handleDragOver(catInfo, e)}
                            on:drop={(e) => handleDrop(catInfo, e)}
                        >
                            <button
                                class="d2ps-sort-row__toggle"
                                on:click={() => toggleCategory(file.fileId, category.categoryId)}
                                aria-label={expandedCategories.has(catKey) ? '折り畳み' : '展開'}
                            >
                                {expandedCategories.has(catKey) ? '▼' : '▶'}
                            </button>
                            <button
                                type="button"
                                class="d2ps-sort-row__label d2ps-sort-row__label--clickable"
                                on:click={() => onEditCategory(file.fileId, category.categoryId)}
                            >
                                {category.categoryId}
                            </button>
                            <span class="d2ps-sort-row__close">x</span>
                            <span
                                class="d2ps-sort-row__drag-handle drag-handle w-3"
                                role="button"
                                tabindex="-1"
                                aria-label="ドラッグして並び替え"
                                draggable="true"
                                on:dragstart={(e) => handleDragStart(catInfo, e)}
                                on:dragend={handleDragEnd}
                            ></span>
                            <!-- 削除ボタンは段階6で追加 -->
                        </div>

                        {#if expandedCategories.has(catKey)}
                            {#each displayedItems(file, category, workingOrder) as item (item.name)}
                                {@const itemInfo = makeItemInfo(file.fileId, category.categoryId, item.name)}
                                <!-- タグ行 -->
                                <div
                                    class={rowClasses(itemInfo, 'd2ps-sort-row d2ps-sort-row--item', dragging)}
                                    role="listitem"
                                    on:dragover={(e) => handleDragOver(itemInfo, e)}
                                    on:drop={(e) => handleDrop(itemInfo, e)}
                                >
                                    <span class="d2ps-sort-row__toggle d2ps-sort-row__toggle--leaf">・</span>
                                    <button
                                        type="button"
                                        class="d2ps-sort-row__label d2ps-sort-row__label--clickable"
                                        on:click={() =>
                                            onEditItem(
                                                file.fileId,
                                                category.categoryId,
                                                item.name,
                                                item.prompt
                                            )}
                                    >
                                        {item.name}
                                    </button>
                                    <span class="d2ps-sort-row__close">x</span>
                                    <span
                                        class="d2ps-sort-row__drag-handle drag-handle w-3"
                                        role="button"
                                        tabindex="-1"
                                        aria-label="ドラッグして並び替え"
                                        draggable="true"
                                        on:dragstart={(e) => handleDragStart(itemInfo, e)}
                                        on:dragend={handleDragEnd}
                                    ></span>
                                    <!-- 削除ボタンは段階6で追加 -->
                                </div>
                            {/each}
                        {/if}
                    {/each}
                {/if}
            {/each}
        </div>

        <div class="d2ps-dialog__buttons">
            <button class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY}" on:click={close}
                >閉じる</button
            >
        </div>
    </div>
</dialog>
