<template>
  <q-page padding>
    <p>Export Form Test</p>
    <ExportForm :schema="schema"/>
  </q-page>
</template>
<script>
export default {
  data() {
    return {
      schema: {
        title: 'filename'
      }
    };
  }
};
</script>
<style lang="sass" scoped>
.directive-target
  width: 50px
  height: 50px
</style>
