import * as assert from 'assert';
import { buildTree, findClosestInTree, closestInTree, LocationTree } from './location_tree';


describe('location_tree', function () {

  it('buildTree', function () {
    assert.deepStrictEqual(buildTree([]), { kind: "empty" });

    assert.deepStrictEqual(buildTree([{ x: 1, y: 1 }]),
      { kind: "single", loc: { x: 1, y: 1 } });
    assert.deepStrictEqual(buildTree([{ x: 2, y: 2 }]),
      { kind: "single", loc: { x: 2, y: 2 } });

    assert.deepStrictEqual(buildTree([{ x: 1, y: 1 }, { x: 3, y: 3 }]),
      {
        kind: "split", at: { x: 2, y: 2 },
        nw: { kind: "single", loc: { x: 1, y: 1 } },
        ne: { kind: "empty" },
        sw: { kind: "empty" },
        se: { kind: "single", loc: { x: 3, y: 3 } }
      });
    assert.deepStrictEqual(buildTree([{ x: 1, y: 3 }, { x: 3, y: 1 }]),
      {
        kind: "split", at: { x: 2, y: 2 },
        nw: { kind: "empty" },
        ne: { kind: "single", loc: { x: 3, y: 1 } },
        sw: { kind: "single", loc: { x: 1, y: 3 } },
        se: { kind: "empty" }
      });

    assert.deepStrictEqual(buildTree(
      [{ x: 1, y: 1 }, { x: 3, y: 3 }, { x: 5, y: 5 }, { x: 7, y: 7 }]),
      {
        kind: "split", at: { x: 4, y: 4 },
        nw: {
          kind: "split", at: { x: 2, y: 2 },
          nw: { kind: "single", loc: { x: 1, y: 1 } },
          ne: { kind: "empty" },
          sw: { kind: "empty" },
          se: { kind: "single", loc: { x: 3, y: 3 } }
        },
        ne: { kind: "empty" },
        sw: { kind: "empty" },
        se: {
          kind: "split", at: { x: 6, y: 6 },
          nw: { kind: "single", loc: { x: 5, y: 5 } },
          ne: { kind: "empty" },
          sw: { kind: "empty" },
          se: { kind: "single", loc: { x: 7, y: 7 } }
        }
      });
    assert.deepStrictEqual(buildTree(
      [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }]),
      {
        kind: "split", at: { x: 2, y: 2 },
        nw: {
          kind: "split", at: { x: 0.5, y: 0.5 },
          nw: { kind: "single", loc: { x: 0, y: 0 } },
          ne: { kind: "empty" },
          sw: { kind: "empty" },
          se: { kind: "single", loc: { x: 1, y: 1 } }
        },
        ne: { kind: "empty" },
        sw: { kind: "empty" },
        se: {
          kind: "split", at: { x: 3, y: 3 },
          nw: { kind: "single", loc: { x: 2, y: 2 } },
          ne: { kind: "empty" },
          sw: { kind: "empty" },
          se: {
            kind: "split", at: { x: 3.5, y: 3.5 },
            nw: { kind: "single", loc: { x: 3, y: 3 } },
            ne: { kind: "empty" },
            sw: { kind: "empty" },
            se: { kind: "single", loc: { x: 4, y: 4 } }
          }
        }
      });
    assert.deepStrictEqual(buildTree(
      [{ x: 1, y: 1 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 7, y: 1 },
      { x: 1, y: 7 }, { x: 3, y: 5 }, { x: 5, y: 5 }, { x: 7, y: 7 }]),
      {
        kind: "split", at: { x: 4, y: 4 },
        nw: {
          kind: "split", at: { x: 2, y: 2 },
          nw: { kind: "single", loc: { x: 1, y: 1 } },
          ne: { kind: "empty" },
          sw: { kind: "empty" },
          se: { kind: "single", loc: { x: 3, y: 3 } }
        },
        ne: {
          kind: "split", at: { x: 6, y: 2 },
          nw: { kind: "empty" },
          sw: { kind: "single", loc: { x: 5, y: 3 } },
          ne: { kind: "single", loc: { x: 7, y: 1 } },
          se: { kind: "empty" }
        },
        sw: {
          kind: "split", at: { x: 2, y: 6 },
          nw: { kind: "empty" },
          ne: { kind: "single", loc: { x: 3, y: 5 } },
          sw: { kind: "single", loc: { x: 1, y: 7 } },
          se: { kind: "empty" }
        },
        se: {
          kind: "split", at: { x: 6, y: 6 },
          nw: { kind: "single", loc: { x: 5, y: 5 } },
          ne: { kind: "empty" },
          sw: { kind: "empty" },
          se: { kind: "single", loc: { x: 7, y: 7 } }
        }
      });
  });

  it('closestInTree', function () {
    // TODO: implement this in Task 4
    const region = { x1: 0, x2: 10, y1: 0, y2: 10 };

    // Statement Coverage:
    // Below covers empty tree case
    // Branch Coverage:
    // Covers tree.kind === "empty" branch
    assert.deepStrictEqual(
      closestInTree({ kind: "empty" }, { x: 5, y: 5 }, region, { loc: { x: 1, y: 1 }, dist: 10 }),
      { loc: { x: 1, y: 1 }, dist: 10 }
    );

    // Statement Coverage:
    // Below covers single node case with no previous closest
    // Branch Coverage:
    // Covers tree.kind === "single" branch and closest.loc === undefined branch
    assert.deepStrictEqual(
      closestInTree({ kind: "single", loc: { x: 2, y: 2 } }, { x: 0, y: 0 }, region, { loc: undefined, dist: Infinity }),
      { loc: { x: 2, y: 2 }, dist: Math.sqrt(8) }
    );

    // Statement Coverage:
    // Below covers single node case where existing closest is closer
    // Branch Coverage:
    // Covers tree.kind === "single" branch and newDist >= closest.dist branch
    assert.deepStrictEqual(
      closestInTree({ kind: "single", loc: { x: 5, y: 5 } }, { x: 0, y: 0 }, region, { loc: { x: 1, y: 1 }, dist: Math.sqrt(2) }),
      { loc: { x: 1, y: 1 }, dist: Math.sqrt(2) }
    );

    // Statement Coverage:
    // Below covers single node case where new node is closer
    // Branch Coverage:
    // Covers tree.kind === "single" branch and newDist < closest.dist branch
    assert.deepStrictEqual(
      closestInTree({ kind: "single", loc: { x: 1, y: 1 } }, { x: 0, y: 0 }, region, { loc: { x: 5, y: 5 }, dist: Math.sqrt(50) }),
      { loc: { x: 1, y: 1 }, dist: Math.sqrt(2) }
    );

    // Loop Coverage:
    // Above covers 0 case

    const splitTree: LocationTree = {
      kind: "split",
      at: { x: 5, y: 5 },
      nw: { kind: "single", loc: { x: 2, y: 2 } },
      ne: { kind: "single", loc: { x: 8, y: 2 } },
      sw: { kind: "single", loc: { x: 2, y: 8 } },
      se: { kind: "single", loc: { x: 8, y: 8 } }
    };

    // Statement Coverage:
    // Below covers split node case with NW quadrant as closest
    // Branch Coverage:
    // Covers tree.kind === "split" branch and NW quadrant first
    // Loop Coverage: below covers 1 case
    assert.deepStrictEqual(
      closestInTree(splitTree, { x: 1, y: 1 }, region, { loc: undefined, dist: Infinity }),
      { loc: { x: 2, y: 2 }, dist: Math.sqrt(2) }
    );

    // Statement Coverage:
    // Below covers split node case with NE quadrant being closest
    // Branch Coverage:
    // Covers tree.kind === "split" branch and NE quadrant first
    assert.deepStrictEqual(
      closestInTree(splitTree, { x: 9, y: 1 }, region, { loc: undefined, dist: Infinity }),
      { loc: { x: 8, y: 2 }, dist: Math.sqrt(2) }
    );

    // Statement Coverage:
    // Below covers split node case with SW quadrant being closest
    // Branch Coverage:
    // Covers tree.kind === "split" branch and SW quadrant first
    assert.deepStrictEqual(
      closestInTree(splitTree, { x: 1, y: 9 }, region, { loc: undefined, dist: Infinity }),
      { loc: { x: 2, y: 8 }, dist: Math.sqrt(2) }
    );

    const newSplitTree: LocationTree = {
        kind: "split",
        at: {x: 5, y: 5},
        nw: {kind: "single", loc: {x: 2, y: 2}},
        ne: {kind: "single", loc: {x: 8, y: 2}},
        sw: {kind: "single", loc: {x: 2, y: 8}},
        se: {
            kind: "split",
            at: {x: 7, y: 7},
            nw: {kind: "single", loc: {x: 6, y: 6}},
            ne: {kind: "single", loc: {x: 8, y: 6}},
            sw: {kind: "single", loc: {x: 6, y: 8}},
            se: {kind: "single", loc: {x: 8, y: 8}}
        }
    };

    // Statement Coverage:
    // Below covers nested split tree with SE quadrant and then NW quadrant
    // Branch Coverage:
    // Covers nested split tree traversal and SE quadrant containing another split
    assert.deepStrictEqual(
        closestInTree(newSplitTree, {x: 6, y: 5}, region, {loc: undefined, dist: Infinity}),
        {loc: {x: 6, y: 6}, dist: 1}
    );

    // Loop Coverage: above covers many case

  });

  //TODO: uncomment these in Task 4
  it('findClosestInTree', function () {
    assert.deepStrictEqual(findClosestInTree(
      buildTree([{ x: 2, y: 1 }]),
      [{ x: 1, y: 1 }]),
      [{ x: 2, y: 1 }, 1]);
    assert.deepStrictEqual(findClosestInTree(
      buildTree([{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 3 }]),
      [{ x: 1, y: 1 }]),
      [{ x: 2, y: 1 }, 1]);
    assert.deepStrictEqual(findClosestInTree(
      buildTree([{ x: 1, y: 1 }, { x: 1, y: 5 }, { x: 5, y: 1 }, { x: 5, y: 5 }]),
      [{ x: 2, y: 1 }]),
      [{ x: 1, y: 1 }, 1]);
    assert.deepStrictEqual(findClosestInTree(
      buildTree([{ x: 1, y: 1 }, { x: 1, y: 5 }, { x: 5, y: 1 }, { x: 5, y: 5 }]),
      [{ x: 2, y: 1 }, { x: 4.9, y: 4.9 }]),
      [{ x: 5, y: 5 }, Math.sqrt((5 - 4.9) ** 2 + (5 - 4.9) ** 2)]);
    assert.deepStrictEqual(findClosestInTree(
      buildTree([{ x: 1, y: 1 }, { x: 1, y: 5 }, { x: 5, y: 1 }, { x: 5, y: 5 }]),
      [{ x: 2, y: 1 }, { x: -1, y: -1 }]),
      [{ x: 1, y: 1 }, 1]);
    assert.deepStrictEqual(findClosestInTree(
      buildTree([{ x: 1, y: 1 }, { x: 1, y: 5 }, { x: 5, y: 1 }, { x: 5, y: 5 }]),
      [{ x: 4, y: 1 }, { x: -1, y: -1 }, { x: 10, y: 10 }]),
      [{ x: 5, y: 1 }, 1]);
  });
});
