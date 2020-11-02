<template>
  <li class="thumbnail_sprite">
      <a-avatar v-if="url" shape="square" :size="40" :src="url" />
  </li>
</template>
<script>
export default {
  props: ['url']
}
</script>
<style>
.thumbnail_sprite{
  height: 40px;
  width: 40px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  display:inline-block;
}
</style>



