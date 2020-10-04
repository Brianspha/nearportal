<template>
  <v-app>
    <v-app-bar color="#57b560" app>
      <v-toolbar-title class="mr-12 align-center">
        <v-icon class="mx-4" large> mdi-camera </v-icon>
        <span class="title">NearPotal</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            color="white"
            icon
            v-on="on"
            @click="$store.state.isLoggedIn ? logout() : login()"
          >
            {{ $store.state.isLoggedIn ? "logout" : "login"
            }}<v-icon bottom>{{
              $store.state.isLoggedIn ? "mdi-logout" : "mdi-login"
            }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $store.state.isLoggedIn ? "logout" : "login" }}</span>
      </v-tooltip>
    </v-app-bar>
    <v-main>
      <template>
        <v-card>
          <v-tabs background-color="white" color="black" right>
            <v-tab>Report</v-tab>
            <v-tab>View Complaints</v-tab>
            <v-tab>Map</v-tab>
            <v-tab-item key="1">
              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <v-text-field
                        v-model="title"
                        counter
                        :rules="titleRules"
                        label="Report Title"
                        required
                      ></v-text-field>
                      <v-textarea
                        v-model="description"
                        solo
                        name=" input-7-4"
                        label="Description"
                        counter
                      ></v-textarea>
                      <v-file-input
                        accept="image/*"
                        v-model="files"
                        color="black"
                        counter
                        label="Images"
                        multiple
                        placeholder="Upload Pictures"
                        prepend-icon="mdi-paperclip"
                        outlined
                        :show-size="1000"
                      >
                        <template v-slot:selection="{ index, text }">
                          <v-chip
                            v-if="index < 2"
                            color="black"
                            dark
                            label
                            small
                            >{{ text }}</v-chip
                          >

                          <span
                            v-else-if="index === 2"
                            class="overline grey--text text--darken-3 mx-2"
                            >+{{ files.length - 2 }} File(s)</span
                          >
                        </template>
                      </v-file-input>
                      <v-btn color="white" class="mr-4" @click="getLocation"
                        >Get Location</v-btn
                      >
                      <v-btn
                        :readonly="
                          !valid && files.length === 0 && location !== ''
                        "
                        color=" white"
                        class="mr-4"
                        @click="startUpload"
                        >Submit</v-btn
                      >
                    </v-form>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
            <v-tab-item key="2">
              <v-container fluid>
                <v-row v-if="$store.state.reports.length > 0">
                  <v-col
                    v-for="(report, i) in $store.state.reports"
                    :key="i"
                    cols="12"
                    md="4"
                  >
                    <template>
                      <v-card class="mx-auto" max-width="400">
                        <v-img
                          lazy-src="https://picsum.photos/id/11/100/60"
                          aspect-ratio="1"
                          class="grey lighten-2"
                          max-width="500"
                          max-height="300"
                          :src="report.src"
                          ><template v-slot:placeholder>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-progress-circular
                                indeterminate
                                color="grey lighten-5"
                              ></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                        <v-card-text class="text--primary">
                          <div>{{ report.title }}</div>
                          <div>{{ report.description }}</div>
                          <v-switch
                            value
                            :input-value="report.resolved"
                            v-model="report.resolved"
                            label="Resolved"
                            readonly
                          ></v-switch>
                        </v-card-text>
                        <v-card-actions>
                          <!--                    <v-btn
                            color="orange"
                            @click="goto(report.receipt)"
                            text
                            >View Receipt</v-btn
                          >-->
                          <v-btn
                            v-if="report.resolved"
                            color="orange"
                            @click="goto(report.resolvedLink)"
                            text
                            >Details</v-btn
                          >
                          <v-btn
                            color="orange"
                            @click="openMaps(report.location)"
                            text
                            >View on Map</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </template>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col>
                    <v-card class="mx-auto">
                      <v-card-text>No Reports have been made yet!!</v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
            <v-tab-item key="3">
              <v-container fluid>
                <v-card flat>
                  <v-card-text>Still in development</v-card-text>
                </v-card>
              </v-container>
            </v-tab-item>
          </v-tabs>
        </v-card>
      </template>
      <loading
        :active.sync="isLoading"
        :is-full-page="true"
        transition="bounce-enter-active"
        loader="bars"
      />
    </v-main>
  </v-app>
</template>

<script>
import Loading from "vue-loading-overlay";
// Import stylesheet
import "vue-loading-overlay/dist/vue-loading.css";
import axios from "axios";
import swal from "sweetalert2";
import { login, logout } from "./utils";
import randomString from "randomstring";
export default {
  name: "nearPortal",

  components: {
    Loading,
  },
  data: () => ({
    repo: {},
    db: {},
    orbitdb: {},
    isLoading: false,
    files: [],
    valid: true,
    fileRules: [
      (value) =>
        !value ||
        value.size < 10000000000 ||
        "Avatar size should be less than 100 MB!",
    ],
    title: "",
    titleRules: [
      (v) => !!v || "Title is required",
      (v) =>
        (v && v.length >= 4) ||
        "Title must be greater than equal to 4 characters",
    ],
    description: "",
    descriptioRules: [
      (v) => !!v || "Description is required",
      (v) =>
        (v && v.length >= 5) ||
        "Description must be greater than equal to 20 characters",
    ],
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    select: null,
    items: ["Item 1", "Item 2", "Item 3", "Item 4"],
    checkbox: false,
    location: "",
  }),
  mounted() {
    this.login();
    this.loadReports();
    // this.createDB();
  },
  methods: {
    logout() {
      this.$store.state.isLoggedIn = false;
      logout();
    },
    login() {
      this.isLoading = true;
      login();
      this.isLoading = false;
      this.$store.state.isLoggedIn = true;
    },
    goto(link) {
      console.log("going to: ", link);
      var win = window.open(link, "_blank");
      win.focus();
    },
    openMaps(geo) {
      var url =
        "http://www.google.com/maps/place/" + geo.lat + "," + geo.longtitude;
      console.log("navigating to url: ", geo);
      var inAppBrowser = window.open(url, "_blank", "location=yes");
    },
    loadReports: async function () {
      this.isLoading = true;
      this.$store.state.reports = [];
      this.$store.state.resolved = [];
      let _this = this;
      console.log("contract: ", window.contract);
      var reportedReports = window.contract
        .getReportsKeys()
        .then((reportedReportsKeys) => {
          if (reportedReportsKeys.length === 0) {
            _this.isLoading = false;
          } else {
            console.log("reportedReportsKeys: ", reportedReportsKeys);
            for (var i = 1; i < reportedReportsKeys.length; i += 2) {
              window.contract
                .getReport({ skyLink: reportedReportsKeys[i] })
                .then((report) => {
                  _this.$store.state.reports.push({
                    title: report.title,
                    src: report.skyLink,
                    description: report.description,
                    resolved: report.resolved,
                    location: JSON.parse(report.location),
                  });
                })
                .finally(() => {
                  console.log(
                    `this.$store.state.reports:`,
                    _this.$store.state.reports
                  );
                  _this.isLoading = false;
                });
            }
          }
        })
        .catch((error) => {
          console.log("error: ", error);
          this.isLoading = false;
        })
        .finally(() => {
          console.log(`this.$store.state.reports:`, _this.$store.state.reports);
          _this.isLoading = false;
        });
    },
    startUpload: async function () {
      this.isLoading = true;
      await Promise.resolve(this.submit());
      this.isLoading = false;
    },
    submit: async function () {
      if (this.$refs.form.validate() && this.files.length > 0) {
        console.log("valid: ", this.valid);
        let This = this;
        var links = [];
        return new Promise(async (resolve) => {
          var counter = 0;
          this.files.map((file) => {
            let formData = new FormData();
            formData.append("file", file);
            axios
              .post("https://siasky.net/skynet/skyfile", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then(async function (response) {
                console.log(
                  `Upload successful, skylink: https://siasky.net/${response.data.skylink}`
                );
                window.contract
                  .logReport({
                    skyLink: `https://siasky.net/${response.data.skylink}`,
                    title: This.title,
                    description: This.description,
                    location: This.location.toString(),
                  })
                  .then(async (results) => {
                    console.log("results: ", results);
                    console.log(
                      "currentCounter: ",
                      counter,
                      "counter>files: ",
                      counter > This.files.length
                    );
                    if (counter === This.files.length - 1) {
                      await Promise.resolve(
                        This.uploadToHub(
                          `https://siasky.net/${response.data.skylink}`
                        )
                      );
                      resolve(true);
                      This.loadReports();
                      This.success("Successfully uploaded files");
                      This.isLoading = false;
                    }
                    counter++;
                  });
              })
              .catch(function (error) {
                console.log("error while uploading file: ", error);
                This.error("Something went wrong whilst uploading video");
                This.isLoading = false;
                resolve(true);
              });
          });
        });
      } else {
        this.error("Missing form data");
      }
    },
    uploadToHub: async function (skyLink) {
      return new Promise((resolve) => {
        axios.post("http://localhost:3000/api/v1/upload/", {
          file: skyLink,
          _id: randomString.generate({ length: 4 }),
        });
      })
        .then(function (response) {
          console.log(response);
          resolve(true);
        })
        .catch(function (error) {
          console.log(error);
          resolve(false);
        });
    },
    getLocation: async function () {
      try {
        this.location = await this.getUserLocation();
        this.location = JSON.stringify({
          lat: this.location.coords.latitude,
          longtitude: this.location.coords.longitude,
        });
        console.log("location: ", this.location);
      } catch (error) {
        console.log("error getting user location: ", error);
        this.error("Seems like your browser doesnt support GeoLocation");
      }
    },
    error(message) {
      swal.fire({
        icon: "error",
        text: message,
      });
    },
    success(message) {
      swal.fire({
        icon: "success",
        text: message,
      });
    },
    async getUserLocation() {
      return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation is not available."));
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve(pos);
          },
          (err) => {
            reject(err);
          }
        );
      });
    },
    successWithFooter(url) {
      swal.fire({
        title: "Success",
        icon: "success",
        html:
          "You can use this link to access your video, " +
          `<a href="${url}">links</a> `,
        showCloseButton: true,
        confirmButtonAriaLabel: "great!",
        cancelButtonText: "Close",
      });
    },
    isSignedIn() {
      return window.walletConnection
        ? window.walletConnection.isSignedIn()
        : false;
    },
    accountId() {
      return window.accountId;
    },
    contractId() {
      return window.contract ? window.contract.contractId : null;
    },
    networkId() {
      return window.networkId;
    },
  },
};
</script>
