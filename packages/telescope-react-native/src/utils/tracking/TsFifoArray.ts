// copy from https://github.com/GeoffWilliams/ts-fifo-array/blob/master/src/index.ts

// an array LIKE object (proxy via composition for safety)
export interface TsFifoArray<T> extends Array<T> {
  max: number;
}

export default<T>(max: number, array: T[] = []): TsFifoArray<T> => {

  // chomp the first elements of the array to make the total length <= max
  const chompToMaxFromStart = (): T[] => {
    const trim: [start: number, deleteCount: number] = [0, array.length - max];
    return Array.prototype.splice.apply(array, trim) as T[];
  };

  const chompToMaxFromEnd = (): T[] => {
    const trim: [start: number, deleteCount: number] = [max, array.length - max];
    return Array.prototype.splice.apply(array, trim) as T[];
  };


  // Error checking
  if (max < 1) {
    throw new Error('invalid `max` value provided to FifoArray()');
  }

  // push
  // The push() method of Array instances adds the specified elements to the
  // end of an array and returns the new length of the array.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
  array["push"] = (...items: T[]) => {
    Array.prototype.push.apply(array, items); // apply the original method
    chompToMaxFromStart();
    return array.length;
  };
  Object.defineProperty(array, "push", {
    enumerable: false
  }); // hide it

  // unshift
  // The unshift() method of Array instances adds the specified elements to
  // the beginning of an array and returns the new length of the array.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
  array["unshift"] = (...items: T[]) => {
    Array.prototype.unshift.apply(array, items); // apply the original method
    chompToMaxFromEnd();

    return array.length;
  };
  Object.defineProperty(array, "unshift", {
    enumerable: false
  }); // hide it

  // splice
  // The splice() method of Array instances changes the contents of an array
  // by removing or replacing existing elements and/or adding new elements in place.
  // Returns an array containing the deleted elements.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
  array["splice"] = (start: number, deleteCount: number, ...items: T[]) => {
    const deletedByRequest = Array.prototype.splice.apply(array, [start, deleteCount, ...items]) as T[]; // apply the original method

    const deletedByMax = chompToMaxFromEnd();
    return [...deletedByRequest, ...deletedByMax];
  };
  Object.defineProperty(array, "splice", {
    enumerable: false
  }); // hide it


  // Manage the .max property
  Object.defineProperty(array, 'max', {
    get: () => {
      return max;
    },
    set: (newMax: number) => {
      max = newMax;
      chompToMaxFromEnd(); // trim when necessary
    },
    enumerable: false // hide it
  });

  // Chomp the initial array if needed
  chompToMaxFromStart();

  // mmm, bacon!
  // amen brother
  return array as TsFifoArray<T>;
};
