<script lang="ts">
  import { Constants } from '../Constants';
  import { tooltip } from '../stores/ui';

  export let name: string;
  export let prompt: string;
  export let onClickTag: (prompt: string, closePanel: boolean) => void;

  function handleClick(e: MouseEvent) {
    onClickTag(prompt, e.ctrlKey);
  }

  function handleRightClick(e: MouseEvent) {
    e.preventDefault();
    onClickTag(prompt, true);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<button
  class="{Constants.CSS_CLASS_BUTTON} d2ps-button--tag"
  on:click={handleClick}
  on:contextmenu={handleRightClick}
  on:mouseenter={() => tooltip.set(prompt)}
  on:mouseleave={() => tooltip.set('')}
>
  {name}
</button>
