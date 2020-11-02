<template>
  <div class="sprite_tree">
      <ul>
          <Thumbnail url=""  />
      </ul>
  </div>
</template>

<script>
import Thumbnail from '../common/Thumbnail.vue'

/* 获取tree数据 */
function getTree() {

}
export default {
  components: {
    Thumbnail
  },

  setup() {
    const treeRef = ref(false);
    return {
      treeRef,
    };
  },
};
</script>

<style scoped>

</style>
