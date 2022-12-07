<template>
  <div>
    <h4>Info Screens</h4>
    <p>
      This will add text only info screens to the end of the rotation. You can set them up to start and end at a certain
      time
    </p>

    <b-button id="create_info_screen_btn" v-b-modal.create variant="primary" class="mb-4">Create Info Screen</b-button>

    <h4>Current Info Screens</h4>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>Start</th>
          <th>End</th>
          <th>Message</th>
          <th></th>
        </tr>
      </thead>
      <tbody v-if="sortedScreens">
        <tr v-for="screen in mutableScreens" :key="screen.id">
          <td>{{ screen.start }}</td>
          <td>{{ screen.isInfinite ? "-" : screen.end }}</td>
          <td class="message">
            <textarea class="form-control" disabled readonly :value="screen.message" rows="8"></textarea>
          </td>
          <td class="actions">
            <b-button variant="danger" @click="deleteScreen(screen.id)" :disabled="saveState.saving || isDeleting"
              >Delete</b-button
            >
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="3" class="table-info">There are currently no active info screens</td>
        </tr>
      </tbody>
    </table>

    <b-modal
      ref="create_modal"
      id="create"
      title="Create Info Screen"
      size="lg"
      centered
      ok-title="Save"
      :ok-disabled="saveState.saving || !canSave"
      ok-variant="success"
      @ok="saveInfoScreen"
    >
      <div v-if="saveState.error" class="alert alert-danger">Unable to save info screen</div>
      <div>
        <b>Message</b>
        <textarea id="create_message" class="form-control" length="256" v-model="message" rows="8" />
      </div>

      <div>
        <b>Start Date</b>
        <input type="date" class="form-control" v-model="start" :min="minDateAllowed" />
      </div>

      <div>
        <b>End Date</b>
        <input type="date" class="form-control" v-model="end" />
      </div>

      <b-form-checkbox id="is_infinite" v-model="isInfinite">
        Keep until manually deleted?
      </b-form-checkbox>
    </b-modal>
  </div>
</template>

<script>
import { format } from "date-fns";

const TODAY = format(new Date(), "yyyy-MM-dd");

export default {
  name: "config-info-screens",
  props: {
    screens: Array,
    saveState: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      minDateAllowed: TODAY,
      mutableScreens: false,
      message: "",
      start: TODAY,
      end: "",
      isInfinite: false,
      isDeleting: false,
    };
  },

  watch: {
    screens() {
      this.createMutableScreens();
    },
  },

  mounted() {
    this.createMutableScreens();
  },

  computed: {
    canSave() {
      return this.message && this.start && (this.end || this.isInfinite);
    },

    sortedScreens() {
      return this.mutableScreens.length && [...this.mutableScreens].sort((a, b) => b.start - a.start);
    },
  },

  methods: {
    createMutableScreens() {
      this.mutableScreens = this.screens;
    },

    clearMessage() {
      this.message = "";
    },

    saveInfoScreen() {
      this.$emit("save", {
        message: this.message,
        start: this.start,
        end: this.end,
        isInfinite: this.isInfinite,
        callback: () => {},
      });
    },

    deleteScreen(id) {
      this.isDeleting = true;
      this.$http
        .delete(`/config/infoscreens/${id}/delete/`)
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          const { info_screens } = data;
          this.mutableScreens.splice(0, this.mutableScreens.length, ...info_screens);
        })
        .catch(() => {})
        .then(() => {
          this.isDeleting = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
textarea {
  font-family: monospace;
  text-align: center;
  text-transform: uppercase;
}

.table {
  .actions {
    .btn {
      display: block;
      margin: 0 auto;

      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
}
</style>
