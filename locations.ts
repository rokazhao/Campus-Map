/** Represents an (x, y) coordinate location on the map. */
export type Location = {x: number, y: number};

/** 
 * Determines whether the two given locations are the same. 
 * @returns true if (loc1.x, loc1.y) = (loc2.x, loc2.y)
 */
export const sameLocation = (loc1: Location, loc2: Location): boolean => {
  return loc1.x === loc2.x && loc1.y === loc2.y;
}

/** 
 * Returns the squared distance between the two given locations 
 * @returns dist(loc1, loc2)^2
 */
export const squaredDistance = (loc1: Location, loc2: Location): number => {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return dx*dx + dy*dy;
};

/** 
 * Returns the distance between the two given locations 
 * @returns dist(loc1, loc2)
 */
export const distance = (loc1: Location, loc2: Location): number => {
  return Math.sqrt(squaredDistance(loc1, loc2));
};

/**
 * Returns the average position of the given locations.
 * @param locs to average over, length must be >= 1
 * @returns Location representing average of all locs
 */
export const centroid = (locs: Array<Location>): Location => {
  let sx = 0;
  let sy = 0;
  let i = 0;
  
  // Inv: sx = sum of locs[j].x for j = 0 .. i-1 and
  //      sy = sum of locs[j].y for j = 0 .. i-1
  while (i !== locs.length) {
    sx += locs[i].x;
    sy += locs[i].y;
    i = i + 1;
  }

  return {x: sx / locs.length, y: sy / locs.length};
};


/**
 * Represents a rectangular range of space on the map. Note that infinite values
 * (Infinity and -Infinity) are allowed for the ends of either dimension.
 * Inv: x1 <= x2 and y1 <= y2
 */
export type Region = {x1: number, x2: number, y1: number, y2: number};


/**
 * Determines whether the distance from a given location to a given region 
 * is more than the given distance.
 * 
 * @param loc given location
 * @param region given region
 * @param dist to compare to distance between loc and region
 * @returns true if the distance from loc to closest point in Region is > than dist
 */
export const distanceMoreThan = (loc: Location, region: Region, dist: number): boolean => {
  // TODO: implement this in Task 3
  // INSIDE REGION
  if (loc.x >= region.x1 && loc.x <= region.x2 && loc.y >= region.y1 && loc.y <= region.y2) {
      return false;
  }
  
  //LEFT SIDE + Corners
  if (loc.x < region.x1) {
    if (loc.y < region.y1) {
      const newDist = squaredDistance(loc, { x: region.x1, y: region.y1});
      return distanceHelper(newDist, dist);
    } else if (loc.y > region.y2) {
      const newDist = squaredDistance(loc, { x: region.x1, y: region.y2});
      return distanceHelper(newDist, dist);
    } else {
      const newDist = region.x1 - loc.x;
      return (newDist > dist);
    }
  } //RIGHT SIDE + Corners
  else if (loc.x > region.x2) {
    if (loc.y < region.y1) {
      const newDist = squaredDistance(loc, { x: region.x2, y: region.y1});
      return distanceHelper(newDist, dist);
    } else if (loc.y > region.y2) {
      const newDist = squaredDistance(loc, { x: region.x2, y: region.y2});
      return distanceHelper(newDist, dist);
    } else {
      const newDist = loc.x - region.x2;
      return (newDist > dist);
    }
  } // BELOW
  else if (loc.x >= region.x1 && loc.x <= region.x2 && loc.y > region.y2) {
    const newDist = loc.y - region.y2;
    return (newDist > dist);
  } // ABOVE 
  else {
    const newDist = region.y1 - loc.y;
    return (newDist > dist);
  }
      
      
}

const distanceHelper = (newDist: number, dist: number): boolean => {
  const newVal = dist * dist;
      if (newDist > newVal) {
        return true;
      } else {
        return false;
      }
}