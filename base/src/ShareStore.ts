import { ValueCenter } from 'wy-helper';

interface StringBridge<T> {
  toString(v: T): string;
  fromString(v: string): T;
  value: ValueCenter<T>;
}

export function defaultToString(v: any) {
  return `${v}`;
}
export function jsonToString(v: object) {
  return JSON.stringify(v);
}
export function createShareStore({
  map,
  read,
  write,
}: {
  map: {
    [key: string]: StringBridge<any>;
  };
  read(key: string): string;
  write(key: string, value: string): void;
}) {
  const mapList = Object.entries(map).map(function ([key, value]) {
    function notify(v: any) {
      write(key, value.toString(v));
    }
    return {
      init() {
        value.value.set(read(key));
      },
      destroy: value.value.subscribe(notify),
    };
  });
  return {
    init() {
      mapList.forEach(function ({ init }) {
        init();
      });
    },
    destroy() {
      mapList.forEach(function ({ destroy }) {
        destroy();
      });
    },
  };
}
