<template>
  <div class="oxhunt-admin">
    <header>
      <img class="oxhunt-logo" src="@/assets/ox-hunt-logo.svg" />
      <nav>
        <ul class="oxhunt-admin__menu">
          <li :class="{ selected: TABS.USERS === tabIndex }" @click="tabIndex = TABS.USERS">
            {{$t("admin-users")}}
          </li>
          <li :class="{ selected: TABS.GAMES === tabIndex }" @click="tabIndex = TABS.GAMES">
            {{$t("admin-games")}}
          </li>
        </ul>
      </nav>
      <button class="oxhunt-csv-button" @click="csvClickHandler" :title="$t('admin-download')">
        <img src="@/assets/icons/download.svg" />
        <a ref="cvsAnchor" :href="generatedCsv" :download="csvName"></a>
      </button>
    </header>
    <main>
      <div class="oxhunt-cashier">
        Cashier token: <span>{{settings?.cashierToken}}</span>
      </div>
      <div class="oxhunt-data">
      <GamesView v-if="TABS.GAMES === tabIndex" @csv="csvHandler($event)"></GamesView>
      <UsersView
        v-if="TABS.USERS === tabIndex"
        @csv="csvHandler($event)"
      ></UsersView>
      </div>
    </main>
  </div>
</template>

<script>
import UsersView from './UsersView.vue';
import GamesView from './GamesView.vue';
import firebaseService from "../../services/firebase.service.js";

export default {
  name: "AdminView",
  created() {
    this.TABS = {
      GAMES: 0,
      USERS: 1,
    };
  },
  data() {
    return {
      tabIndex: 1,
      generatedCsv: null,
      csvName: "users.csv",
      settings: null
    };
  },
  components: {
    GamesView,
    UsersView,
  },
  async beforeMount() {
    firebaseService.getSettings(false).then((response) => {
        this.settings = response;
    }).catch((error) => {
      console.error(error);
      this.users = null;
    });
  },
  methods: {
    csvHandler(eventData) {
      this.generatedCsv = eventData.csv;
      this.csvName = eventData.name;
    },
    csvClickHandler() {
      if (this.generatedCsv) {
        this.$refs.cvsAnchor.click();
      }
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../../public/css/vars.css';
.oxhunt-csv-button {
  background: none;
}
.oxhunt-admin {
    img {
      margin: 0 1em 0 1em;
      height: 100%;
    }

    header {
        height: 64px;
        color: white;
        background-color: var(--color-primary);
        display: flex;
        align-items: center;
        font-size: 20px;
        font-weight: 800;
    }
    main {
        height: calc(100vh - 64px);
        background-color: var(--color-background-light);
    }

    .oxhunt-logo {
      width: 130px !important;
    }
}

.oxhunt-admin__menu {
    li {
        cursor: pointer;
        font-family: var(--font-default);
        font-size: 20px;
        height: 64px;
        padding: 20px;
        box-sizing: border-box;
        &.selected {
            cursor: default;
            height: 30px;
            margin-top: auto;
            margin-bottom: auto;
            border-radius: 50px;
            background-color: rgba(255, 255, 255, 0.15) !important;
        }
    }
}

button {
    width: unset;
    height: 70%;
    margin-left: auto;
    margin-right: 10px;
}

.oxhunt-cashier {
  margin-left: 3%;
  font-size: 14px;
  margin-top: 1%;
    margin-bottom: 1%;
  span {
    margin-left: 10px;
    font-size: 14px;
    color: var(--color-secondary);
  }
}

.oxhunt-data {
  max-height: 500px;
    overflow-y: scroll;
}

</style>