<template>
  <div class="oxhunt-datatable">
    <div class="oxhunt-filter wrapper2">
      <div>
        <label class="label-filter" for="filter">{{$t("admin-filter")}}:</label>
        <input v-model="textFilter" id="filter" />
      </div>
      <div class="oxhunt-filter__switch">
        <span style="margin-right: 5%" @click="isAsc = true" :class="isAsc ? 'oxhunt-filter__switch--labelActive' : 'oxhunt-filter__switch--labelNoActive'">{{$t("admin-asc")}}</span>
        <span @click="isAsc = false" :class="!isAsc ? 'oxhunt-filter__switch--labelActive' : 'oxhunt-filter__switch--labelNoActive'">{{$t("admin-desc")}}</span>
      </div>
    </div>
    <div v-for="user in options" :key="user.user + user.sceneOid">
      <div @click="user.showPanel = !user.showPanel" class="oxhunt-user">
        <span>{{user.user}}</span>
        <span class="oxhunt-user__open" v-if="!user.showPanel">+</span>
        <span class="oxhunt-user__open" v-if="user.showPanel">-</span>
      </div>
      <div v-if="user.showPanel" class="oxhunt-user oxhunt-user__info">
        <div class="wrapper">
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-project")}}:</span> {{user.projectOid}}
          </div>
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-scene")}}:</span> {{user.sceneOid}}
          </div>
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-played-date")}}:</span> {{user.playedAt}}
          </div>
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-score")}}:</span> {{user.score}}
          </div>
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("home-redeem")}}:</span> {{user.redeemed}}
          </div>
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-redeemed-date")}}:</span> {{user.redeemedAt}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebaseService from "../../services/firebase.service.js";

export default {
  name: "GamesView",
  components: {
  },
  data() {
    return {
      columnDefs: [
      { headerName: "User", field: "user", sortable: true },
      { headerName: "Project", field: "projectOid", sortable: true },
      { headerName: "Scene", field: "sceneOid", sortable: true },
      { headerName: "Played date", field: "playedAt", sortable: true },
      { headerName: "Score", field: "score", sortable: true },
      { headerName: "Redeemed", field: "redeemed", sortable: true },
      { headerName: "Redeemed date", field: "redeemedAt", sortable: true }
    ],
      rowData: null,
      defaultColDef: { resizable: true, sortable: false, filter: true },
      gridApi: null,
      gridColumnApi: null,
      confirmParams: null,
      textFilter: '',
      isAsc: true,
    };
  },
  async beforeMount() {    
    firebaseService.getUsers().then((response) => {
        this.reloadUsers(response);
      }).catch((error) => {
        console.error(error);
        this.users = null;
      });
  },
  computed: {
    options() {
      if (this.rowData !== null) {
        this.sortData();
        if (this.textFilter === '') {
          this.rowData.map(row => {
            row.showPanel = false;
          })
          return this.rowData;
        } else {
          let data = [];
          this.rowData.forEach(row => {
            let hasText = false;
            this.columnDefs.forEach(column => {
              const field = column.field;
              if (row && row[field] && row[field].toString().toLowerCase().includes(this.textFilter.toLowerCase())) {
                hasText = true;
              }
            })
            if (hasText) {
              row.showPanel = true;
              data.push(row);
            }
          })
          return data;
        }
      }
      return [];
    }
  },
  methods: {
    reloadUsers(users) {
      this.rowData = [];
      for (const user of users) {
        user.playedGames.forEach(game => {
          Object.assign(game, {
            user: user.email,
            playedAt: this.dateFormatter(new Date(game.playedAt)),
            redeemed: game.redeemedAt != undefined,
            redeemedAt: game.redeemedAt != undefined ? this.dateFormatter(new Date(game.redeemedAt)) : undefined
          });
          game.showPanel = false;
          this.rowData.push(game);
        });
      }
      this.getCsv();
    },
    sortData() {
      if (this.isAsc) {
        this.rowData.sort(((a, b) => {
          if (a.user && b.user) {
            if(a.user.toLowerCase() == b.user.toLowerCase()) {
              return 0; 
            }
            if(a.user.toLowerCase() < b.user.toLowerCase()) {
              return -1;
            }
          }
          return 1;
        }));
      } else {
        this.rowData.sort(((a, b) => {
          if (a.user && b.user) {
            if(a.user.toLowerCase() == b.user.toLowerCase()) {
              return 0; 
            }
            if(a.user.toLowerCase() > b.user.toLowerCase()) {
              return -1;
            }
          }
          return 1;
        }));
      }
    },
    openPanel(header) {
      this.columnDefs.map(column => {
        if (column.field === header) {
          column.showFilter = true;
        } else {
          column.showFilter = false;
        }
      })
    },
    onFirstDataRendered() {
      this.gridColumnApi.autoSizeColumns();
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    dateFormatter(params) {
      return params !== undefined && params !== null ? params.toLocaleString().replace(',', '') : undefined;
    },
    getCsv() {
      const infoArray = [this.columnDefs.map((col) => col.headerName)];
      this.rowData.forEach((row) => {
        infoArray.push([this.columnDefs.map((col) => row[col.field])]);
      });
      this.$emit(
        "csv",
        { 
          csv: encodeURI(
            "data:text/csv;charset=utf-8," +
              infoArray.map((e) => e.join(",")).join("\n")
            ),
          name: "playedgames.csv"
        }
      );
    },
  },
};
</script>
<style scoped lang="scss">
@import '../../../public/css/vars.css';
.oxhunt-datatable {
  height: 450px;
    width: 80%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 5%
}

#filter {
  height: 45px !important;
  width: 215px;
}

.label-filter {
  margin-right: 18px;
}

.oxhunt-user {
  background-color: rgba(88, 0, 136, .15);
  color: black;
  cursor: pointer;
  padding: 18px;
  border: none;
  text-align: left;
  outline: none;
  font-size: 14px;
  margin-bottom: 1%;
  font-family: var(--font-default);
  &__info {
    background: white;
    border: 1px solid #dee2e6;
    &--label{
      font-weight: bold;
      background: transparent;
      padding:0;
    }
  }
  &__open {
    float: right;
  }
}

@media (min-width: 600px) {
  .wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px;
    font-size: 14px;
    font-family: var(--font-light);
  }
}

@media (min-width: 10px) {
  .wrapper {
    font-size: 14px;
  font-family: var(--font-light);
  }
}

@media (min-width: 500px) {
  .wrapper2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px;
    font-size: 14px;
    font-family: var(--font-light);
  }
}

@media (min-width: 10px) {
  .wrapper2 {
    font-size: 14px;
  font-family: var(--font-light);
  }
}

.oxhunt-filter {
  padding: 20px;
    border: 1px solid #dee2e6;
    margin-bottom: 2%;
  &__switch {
    margin-left: auto;
    margin-top: 2vh;
    cursor: pointer;
    &--labelActive {
      padding: 8px;
      background: #580088;
      color: white;
      border-radius: 15px;
    }
    &--labelNoActive{
      padding: 8px;
      background: #dee2e6;
      color: black;
      border-radius: 15px;
    }
  }
}

</style>