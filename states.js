// Auto-generated verified state data for Vakil's Geometric Littlewood-Richardson rule,
// Figure 3 example: n=4, k=2, alpha=beta={2,4} (lines meeting a fixed line in P^3).
const GAME = {
 "n": 4,
 "k": 2,
 "A": [
  2,
  4
 ],
 "B": [
  2,
  4
 ],
 "root": 0,
 "target_dim": 2,
 "inputPartition": [
  1,
  0
 ],
 "perms": [
  "4321",
  "4312",
  "4132",
  "4123",
  "1423",
  "1243",
  "1234"
 ],
 "nodes": [
  {
   "id": 0,
   "move": 0,
   "whites": [
    [
     2,
     4
    ],
    [
     4,
     2
    ]
   ],
   "black": [
    [
     1,
     4
    ],
    [
     2,
     3
    ],
    [
     3,
     2
    ],
    [
     4,
     1
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 1
    }
   ],
   "critRow": 4,
   "critCol": 2,
   "critDiag": [
    [
     1,
     4
    ],
    [
     2,
     3
    ],
    [
     3,
     2
    ],
    [
     4,
     1
    ]
   ],
   "descFrom": [
    3,
    2
   ],
   "descTo": [
    4,
    2
   ],
   "riseFrom": [
    4,
    1
   ],
   "riseTo": [
    3,
    1
   ]
  },
  {
   "id": 1,
   "move": 1,
   "whites": [
    [
     2,
     4
    ],
    [
     4,
     2
    ]
   ],
   "black": [
    [
     1,
     4
    ],
    [
     2,
     3
    ],
    [
     3,
     1
    ],
    [
     4,
     2
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 2
    }
   ],
   "critRow": 3,
   "critCol": 3,
   "critDiag": [
    [
     1,
     4
    ],
    [
     2,
     3
    ],
    [
     3,
     2
    ],
    [
     4,
     1
    ]
   ],
   "descFrom": [
    2,
    3
   ],
   "descTo": [
    3,
    3
   ],
   "riseFrom": [
    3,
    1
   ],
   "riseTo": [
    2,
    1
   ]
  },
  {
   "id": 2,
   "move": 2,
   "whites": [
    [
     2,
     4
    ],
    [
     4,
     2
    ]
   ],
   "black": [
    [
     1,
     4
    ],
    [
     2,
     1
    ],
    [
     3,
     3
    ],
    [
     4,
     2
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 3
    },
    {
     "choice": "swap",
     "child": 7
    }
   ],
   "critRow": 4,
   "critCol": 3,
   "critDiag": [
    [
     2,
     4
    ],
    [
     3,
     3
    ],
    [
     4,
     2
    ]
   ],
   "descFrom": [
    3,
    3
   ],
   "descTo": [
    4,
    3
   ],
   "riseFrom": [
    4,
    2
   ],
   "riseTo": [
    3,
    2
   ]
  },
  {
   "id": 3,
   "move": 3,
   "whites": [
    [
     2,
     4
    ],
    [
     3,
     2
    ]
   ],
   "black": [
    [
     1,
     4
    ],
    [
     2,
     1
    ],
    [
     3,
     2
    ],
    [
     4,
     3
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 4
    }
   ],
   "critRow": 2,
   "critCol": 4,
   "critDiag": [
    [
     1,
     4
    ],
    [
     2,
     3
    ],
    [
     3,
     2
    ],
    [
     4,
     1
    ]
   ],
   "descFrom": [
    1,
    4
   ],
   "descTo": [
    2,
    4
   ],
   "riseFrom": [
    2,
    1
   ],
   "riseTo": [
    1,
    1
   ]
  },
  {
   "id": 4,
   "move": 4,
   "whites": [
    [
     2,
     4
    ],
    [
     3,
     2
    ]
   ],
   "black": [
    [
     1,
     1
    ],
    [
     2,
     4
    ],
    [
     3,
     2
    ],
    [
     4,
     3
    ]
   ],
   "children": [
    {
     "choice": "swap",
     "child": 5
    }
   ],
   "critRow": 3,
   "critCol": 4,
   "critDiag": [
    [
     2,
     4
    ],
    [
     3,
     3
    ],
    [
     4,
     2
    ]
   ],
   "descFrom": [
    2,
    4
   ],
   "descTo": [
    3,
    4
   ],
   "riseFrom": [
    3,
    2
   ],
   "riseTo": [
    2,
    2
   ]
  },
  {
   "id": 5,
   "move": 5,
   "whites": [
    [
     2,
     2
    ],
    [
     3,
     4
    ]
   ],
   "black": [
    [
     1,
     1
    ],
    [
     2,
     2
    ],
    [
     3,
     4
    ],
    [
     4,
     3
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 6
    }
   ],
   "critRow": 4,
   "critCol": 4,
   "critDiag": [
    [
     3,
     4
    ],
    [
     4,
     3
    ]
   ],
   "descFrom": [
    3,
    4
   ],
   "descTo": [
    4,
    4
   ],
   "riseFrom": [
    4,
    3
   ],
   "riseTo": [
    3,
    3
   ]
  },
  {
   "id": 6,
   "move": 6,
   "whites": [
    [
     2,
     2
    ],
    [
     3,
     3
    ]
   ],
   "black": [
    [
     1,
     1
    ],
    [
     2,
     2
    ],
    [
     3,
     3
    ],
    [
     4,
     4
    ]
   ],
   "children": [],
   "output": [
    2,
    3
   ],
   "partition": [
    1,
    1
   ]
  },
  {
   "id": 7,
   "move": 3,
   "whites": [
    [
     2,
     1
    ],
    [
     4,
     4
    ]
   ],
   "black": [
    [
     1,
     4
    ],
    [
     2,
     1
    ],
    [
     3,
     2
    ],
    [
     4,
     3
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 8
    }
   ],
   "critRow": 2,
   "critCol": 4,
   "critDiag": [
    [
     1,
     4
    ],
    [
     2,
     3
    ],
    [
     3,
     2
    ],
    [
     4,
     1
    ]
   ],
   "descFrom": [
    1,
    4
   ],
   "descTo": [
    2,
    4
   ],
   "riseFrom": [
    2,
    1
   ],
   "riseTo": [
    1,
    1
   ]
  },
  {
   "id": 8,
   "move": 4,
   "whites": [
    [
     1,
     1
    ],
    [
     4,
     4
    ]
   ],
   "black": [
    [
     1,
     1
    ],
    [
     2,
     4
    ],
    [
     3,
     2
    ],
    [
     4,
     3
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 9
    }
   ],
   "critRow": 3,
   "critCol": 4,
   "critDiag": [
    [
     2,
     4
    ],
    [
     3,
     3
    ],
    [
     4,
     2
    ]
   ],
   "descFrom": [
    2,
    4
   ],
   "descTo": [
    3,
    4
   ],
   "riseFrom": [
    3,
    2
   ],
   "riseTo": [
    2,
    2
   ]
  },
  {
   "id": 9,
   "move": 5,
   "whites": [
    [
     1,
     1
    ],
    [
     4,
     4
    ]
   ],
   "black": [
    [
     1,
     1
    ],
    [
     2,
     2
    ],
    [
     3,
     4
    ],
    [
     4,
     3
    ]
   ],
   "children": [
    {
     "choice": "stay",
     "child": 10
    }
   ],
   "critRow": 4,
   "critCol": 4,
   "critDiag": [
    [
     3,
     4
    ],
    [
     4,
     3
    ]
   ],
   "descFrom": [
    3,
    4
   ],
   "descTo": [
    4,
    4
   ],
   "riseFrom": [
    4,
    3
   ],
   "riseTo": [
    3,
    3
   ]
  },
  {
   "id": 10,
   "move": 6,
   "whites": [
    [
     1,
     1
    ],
    [
     4,
     4
    ]
   ],
   "black": [
    [
     1,
     1
    ],
    [
     2,
     2
    ],
    [
     3,
     3
    ],
    [
     4,
     4
    ]
   ],
   "children": [],
   "output": [
    1,
    4
   ],
   "partition": [
    2,
    0
   ]
  }
 ]
};
const P3 = {
 "fixed": {
  "f1": [
   0.0,
   0.0,
   0.0
  ],
  "f2": [
   3.2,
   0.0,
   0.0
  ],
  "f3": [
   0.0,
   3.2,
   0.0
  ]
 },
 "moving": [
  {
   "p": [
    1.15,
    2.15,
    2.55
   ],
   "q": [
    3.45,
    2.75,
    1.15
   ],
   "s": [
    -0.65,
    3.05,
    1.85
   ]
  },
  {
   "p": [
    1.15,
    2.15,
    2.55
   ],
   "q": [
    3.45,
    2.75,
    1.15
   ],
   "s": [
    0.20806310770702652,
    1.6372198832356775,
    2.6541979126196917
   ]
  },
  {
   "p": [
    1.15,
    2.15,
    2.55
   ],
   "q": [
    -1.035,
    -1.935,
    -2.295
   ],
   "s": [
    0.20806310770702652,
    1.6372198832356775,
    2.6541979126196917
   ]
  },
  {
   "p": [
    1.15,
    2.15,
    2.55
   ],
   "q": [
    -1.035,
    -1.935,
    -2.295
   ],
   "s": [
    3.2,
    0.0,
    0.0
   ]
  },
  {
   "p": [
    0.0,
    0.0,
    0.0
   ],
   "q": [
    -1.035,
    -1.935,
    -2.295
   ],
   "s": [
    3.2,
    0.0,
    0.0
   ]
  },
  {
   "p": [
    0.0,
    0.0,
    0.0
   ],
   "q": [
    3.2,
    0.0,
    0.0
   ],
   "s": [
    3.2,
    0.0,
    0.0
   ]
  },
  {
   "p": [
    0.0,
    0.0,
    0.0
   ],
   "q": [
    3.2,
    0.0,
    0.0
   ],
   "s": [
    0.0,
    3.2,
    0.0
   ]
  }
 ],
 "activeM": [
  3,
  2,
  3,
  1,
  2,
  3
 ]
};
