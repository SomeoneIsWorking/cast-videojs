import mitt from "mitt";

type Events = {
  "log:scroll-up": void;
  "log:scroll-down": void;
};

export const eventBus = mitt<Events>();
