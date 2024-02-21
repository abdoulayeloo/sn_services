export const CardControlBtn = {
  template: `
        <button type="button" class="card-action-btn action btn btn-outline-primary btn" 
                @click="event.stopPropagation()" 
                @mouseover="show=true" @mouseleave="show=false"
                aria-label=""
                title="">
            <i :class="'las la-'+icon"></i>
            <span v-if="show" @mouseover="show=true" @mouseout="show=false">{{ text }}</span>
        </button>
    `,
  props: ["icon", "text"],
  data() {
    return {
      show: false,
    };
  },
};
