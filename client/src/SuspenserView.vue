<template>
  <Suspense>
    <template #default>
      <App />
    </template>
    <template #fallback>
      <div class="oxhunt-suspenser">
        <img alt="oxhunt-logo" src="@/assets/ox-hunt-logo.svg">
      </div>
    </template>
  </Suspense>
</template>

<script>
import App from './App.vue'

export default {
  name: 'SuspenserView',
  components: {
    App
  }
}
</script>
<style lang="scss" scoped>
.oxhunt-suspender {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
}
</style>