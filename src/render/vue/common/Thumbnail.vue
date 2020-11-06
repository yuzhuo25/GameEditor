<template>
      <a-avatar
        v-if="url"
        :size="36"
        shape="square"
        :src="url" />
 
</template>
<script>
import {ref} from "vue"
export default {
  props: ['url', 'active'],

  setup() {
    const rootFile = ref('file://' + localStorage.getItem("rootFile"));
    return {
      rootFile
    }
  }
}
</script>
