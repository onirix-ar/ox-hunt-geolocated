<template>
  <main class="oxhunt-rules" :class="{'open': open, 'window': window}">
    <header v-if="window" class="oxhunt-rules__header">
      <h1>{{$t("rules-title")}}</h1>
      <button class="round" @click="goToHome">
        <img class="logo" src="@/assets/icons/close.svg" />
      </button>
    </header>
    <div class="oxhunt-rules__content">
      <img alt="OxHunt rules" src="@/assets/join-hero@3x.jpg" />
      <h2>{{$t("rules-welcome")}}</h2>
      <p>{{$t("rules-li1")}}</p>
      <p>{{$t("rules-li2")}}</p>

        <p class="oxhunt-policy">
          <a :href="legalLink" target="_blank">{{$t("oxhunt-policy")}}</a>.
        </p>

        <p>{{$t("rules-p")}}</p>
    </div>
    <footer v-if="!window" class="oxhunt-rules__footer">
      <button @click="goToRegister">
        {{$t("oxhunt-get-started")}}
      </button>
    </footer>
  </main>
</template>

<script>
import Constants from "../constants";

export default {
  name: "RulesView",
  props: {
    window: Boolean,
    open: Boolean
  },
  data() {
        return {
          legalLink: Constants.LEGAL_LINK,
        }
  },
  methods: {
    goToHome() {
      this.$emit('close');
    },
    goToRegister() {
      this.$router.push('/register');
    }
  }
};
</script>
<style lang="scss" scoped>

.oxhunt-rules__content > h2 {
  margin: 20px 0px 16px 0px;
  font-size: 24px;
  font-weight: 800;
  color: black;
}

.oxhunt-rules__content > p.oxhunt-policy {
  padding-top: 30px;
  text-align: center;
  font-size: 20px !important;
  margin-top: 30px;
  border-top: 1px solid #c5c9cd;
  a {
    color: black !important;
  }
}

.oxhunt-rules {
  position: absolute;
  height: calc(100%);
  width: calc(100vw);

  display: flex;
  flex-direction: column;

  background-color: var(--color-background-light);
  transition: all .4s ease-in-out;

  overflow-y: auto;

  &.window {
    top: 150vh;
  }

  &.open {
    z-index: 1;
    top: 0;
  }

  .oxhunt-rules__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    height: 20px;
    background-color: var(--color-primary);
    color: var(--color-font-light);
    margin-bottom: 30px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      font-family: var(--font-light);
    }

    button {
      margin-bottom: -35px;
    }
  }

  .oxhunt-rules__content {
    display: flex;
    flex-direction: column;
    color: black;
    height: calc(100% - 60px);
    overflow-y: auto;
    padding: 0px 20px 20px 20px;

    img {
      margin-bottom: 20px;
      border-radius: 10px;
      width: 100%;
    }

    h2 {
      font-family: var(--font-default);
      margin: 0 0 10px 0;
      font-size: 22px;
      font-weight: 800;
    }

    p {
      font-family: var(--font-medium);
      font-size: 18px;
      font-weight: 500;
      margin: 0;
    }
    p + p {
      margin-top: 1em;
    }
  }

  .oxhunt-rules__footer {
    margin: auto -20px -20px -20px;
    padding: 20px;
    background-color: black;
  }
}
</style>