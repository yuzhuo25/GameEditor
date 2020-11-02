<template>
  <div>
    <a-button type="primary" @click="showModal">
      Open Modal
    </a-button>
    <a-modal v-model:visible="visible" keyboard maskClosable :title="title" @ok="handleOk">
      <p>{{content}}</p>
    </a-modal>
  </div>
</template>
<script>
export default {
  data() {
    return {
      visible: false
    };
  },
  props: {
      title: String,
      content: String,
      isShowCancel: Boolean
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      console.log(e);
      this.visible = false;
    }
  }
};
</script>



