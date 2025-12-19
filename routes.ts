import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BUILDINGS, EDGES, getBuildingByShortName, locationsOnPath } from './campus';
import { findPath } from './pathfinder';
import { indexAtHour, jsonifySchedule, parseHour, parseSchedule, Schedule } from "./schedule";
import { Nearby } from "./nearby";
import { Friends } from "./friends";
import { buildTree, findClosestInTree } from "./location_tree";

// TODO: ADD a data structure, and EDIT route handler functions
//        as needed to enable server to store friends for each user
//       - friends.ts defines a type that you can use to represent
//         a set of friends with some helpful functions
const friendsList: Map<string, Friends> = new Map<string, Friends>();


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

// Map from user names to their schedules. Defaults to an empty schedule.
const allSchedules: Map<string, Schedule> = new Map<string, Schedule>();


/** Called from the tests to clear out any data stored during the current test. */
export const clearDataForTesting = (): void => {
  allSchedules.clear();
}

/** Returns a list of friends and a schedule of the user. */
export const getUserData = (req: SafeRequest, res: SafeResponse): void => {
  const user = first(req.query.user);
  if (user === undefined) {
    res.status(400).send('required argument "user" was missing');
    return;
  }

  const schedule = allSchedules.get(user);
  const scheduleJson = schedule === undefined ? [] : jsonifySchedule(schedule);

  const friends = friendsList.get(user) ?? [];

  res.send({schedule: scheduleJson, friends: friends});
}

/** Sets the friends list and/or the scheudle for the given user */
export const setUserData = (req: SafeRequest, res: SafeResponse): void => {
  if (typeof req.body.user !== 'string') {
    res.status(400).send('missing or invalid "user" in POST body');
    return;
  }

  if (req.body.schedule !== undefined) {
    const schedule = parseSchedule(req.body.schedule);
    allSchedules.set(req.body.user, schedule);
  } 

  if (Array.isArray(req.body.friends)) {
    for (const friend of req.body.friends) {
      if (typeof friend !== 'string') {
        res.status(400).send('friend must be a string');
        return;
      }
    }
    friendsList.set(req.body.user, req.body.friends);
  } 

  if (req.body.schedule === undefined && req.body.friends === undefined) {
    res.status(400).send('missing or invalid friends list and schedule');
    return;
  }

  res.send({saved: true});
}


/** Returns a list of all known buildings. */
export const getBuildings = (_req: SafeRequest, res: SafeResponse): void => {
  res.send({buildings: BUILDINGS});
};


/** Returns a list of all known buildings. */
export const getShortestPath = (req: SafeRequest, res: SafeResponse): void => {
  const user = first(req.query.user);
  if (user === undefined) {
    res.status(400).send('required argument "user" was missing');
    return;
  }

  const hourStr = first(req.query.hour);
  if (hourStr === undefined) {
    res.status(400).send('required argument "hour" was missing');
    return;
  }

  const schedule = allSchedules.get(user);
  if (schedule === undefined) {
    res.status(400).send('user has no saved schedule');
    return;
  }

  const hour = parseHour(hourStr);
  const index = indexAtHour(schedule, hour);
  if (index < 0) {
    res.status(400).send('user has no event starting at this hour');
    return;
  } else if (index === 0) {
    res.status(400).send('user is not walking between classes at this hour');
    return;
  }

  // Find the shortest path for this user's walk at this time.
  const start = getBuildingByShortName(schedule[index-1].location);
  const end = getBuildingByShortName(schedule[index].location);
  const path = findPath(start.location, end.location, EDGES);
  if (!path) {
    res.send({found: false});
    return;
  }

  const nearby: Array<Nearby> = [];

  // TODO: initialize with actual list of friends for this user
  //       (feel free to change the type of this variable)
  const friends: Friends | undefined = friendsList.get(user);

  // For any friends that are also walking at this time, record the closest
  // point on _this user's path_ to any point on their walk in the nearby list.
  if (friends !== undefined) {
    // Get all of the locations on the user's walk, put them in a tree
    const userLocs = locationsOnPath(path.steps);
    if (userLocs.length === 0) {
      res.send({found: true, path: path.steps, nearby: []});
      return;
    }

    const userLocsTree = buildTree(userLocs);

    // Iterate through all friends had by this user
    for (const friend of friends) {
      // TODO: make sure 'friend' is friends with 'user' also
      if (friendsList.get(friend) !== undefined) {
        const friendFriends = friendsList.get(friend);
        if (!friendFriends || !friendFriends.includes(user)) {
          continue;
        }
      }
      // Get the friend's schedule. (Can skip them if they don't have one.)
      const fSched = allSchedules.get(friend);
      if (fSched === undefined)
        continue;

      // See if friend walks at this time. (skip them if not.)
      const fIndex = indexAtHour(fSched, hour);
      if (fIndex <= 0)
        continue;
      const fStart = getBuildingByShortName(fSched[fIndex-1].location);
      const fEnd = getBuildingByShortName(fSched[fIndex].location);

      // Find all the points on the friend's walk.
      const fPath = findPath(fStart.location, fEnd.location, EDGES);
      if (!fPath)
        continue;
      const friendLocs = locationsOnPath(fPath.steps);

      // TODO:
      //  - Call findClosestInTree with userLocsTree, and friendLocs
      //    (IF there are any locations in friendLocs)
      //  - Then add to nearby with that closest location, distance,
      //    and the current friend
      if (friendLocs.length > 0) {
        const [closestLoc, dist] = findClosestInTree(userLocsTree, friendLocs);
        nearby.push({
          friend: friend,
          dist: dist,
          loc: closestLoc
        });
      }
    }
  }

  res.send({found: true, path: path.steps, nearby});
};


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};
