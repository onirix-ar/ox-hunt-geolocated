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
    <div v-for="user in options" :key="user.email">
      <div @click="user.showPanel = !user.showPanel" class="oxhunt-user">
        <span>{{user.email}}</span>
        <span class="oxhunt-user__open" v-if="!user.showPanel">+</span>
        <span class="oxhunt-user__open" v-if="user.showPanel">-</span>
      </div>
      <div v-if="user.showPanel" class="oxhunt-user oxhunt-user__info">
        <div class="wrapper">
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-full-name")}}:</span> {{user.fullName}}
          </div>
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-created-at")}}:</span> {{user.createdAt}}
          </div>
          <div>
            <span class="oxhunt-user oxhunt-user__info--label">{{$t("admin-times-redeemed")}}:</span> {{user.timesRedeemed}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebaseService from "../../services/firebase.service.js";

export default {
  name: "UsersView",
  components: {
  },
  data() {
    return {
      columnDefs: [
      { headerName: "Email", field: "email", sortable: true, showFilter: false },
      { headerName: "Full Name", field: "fullName", sortable: true, showFilter: false },
      { headerName: "Created at", field: "createdAt", sortable: true, showFilter: false },
      { headerName: "Times redeemed", field: "timesRedeemed", sortable: true, showFilter: false }
    ],
      rowData: null,
      textFilter: '',
      isAsc: true
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
    sortData() {
      if (this.isAsc) {
        this.rowData.sort(((a, b) => {
          if (a.email && b.email) {
            if(a.email.toLowerCase() == b.email.toLowerCase()) {
              return 0; 
            }
            if(a.email.toLowerCase() < b.email.toLowerCase()) {
              return -1;
            }
          }
          return 1;
        }));
      } else {
        this.rowData.sort(((a, b) => {
          if (a.email && b.email) {
            if(a.email.toLowerCase() == b.email.toLowerCase()) {
              return 0; 
            }
            if(a.email.toLowerCase() > b.email.toLowerCase()) {
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
    reloadUsers(users) {
      this.rowData = users.map((user) => {
        this.calculateTimesRedeemed(user);
        user.createdAt = user.createdAt != undefined ? new Date(user.createdAt._seconds * 1000) : undefined;
        user.createdAt = this.dateFormatter(user.createdAt);
        user.showPanel = false;
        return user;
      });
      this.getCsv();
    },
    calculateTimesRedeemed(user) {
      user.timesRedeemed = 0;
      if (user.playedGames) {
        const dates = new Set();
        for (const pg of user.playedGames) {
          if (pg.redeemedAt) {
            const d = new Date(pg.redeemedAt).setSeconds(0, 0);
            if (!dates.has(d)) {
              dates.add(d);
              user.timesRedeemed++;
            }
          }
        }
      }
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
          name: "users.csv"
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

@media (min-width: 500px) {
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