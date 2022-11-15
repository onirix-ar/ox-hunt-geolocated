<template>
  <router-view></router-view>
</template>
<script>
import '../public/css/fonts.scss';
import '../public/css/normalize.css';
import '../public/css/styles.scss';
import { i18nextPromise } from './i18n';

export default {
  name: 'App',
  async setup() {
    await i18nextPromise;
    return {}
  }
}
</script>
<style>
</style>
