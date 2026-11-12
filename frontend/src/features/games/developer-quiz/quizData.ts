import type { QuizQuestion } from "./quizTypes";

export const MASTER_QUIZ_QUESTIONS: QuizQuestion[] = [
  // 1. Fundamentals
  {
    id: "fund-1",
    category: "fundamentals",
    categoryLabel: "Fundamentals",
    difficulty: "beginner",
    question:
      "What is the average time complexity for accessing an element in an array by its index?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswerIndex: 0,
    explanation:
      "Arrays use contiguous memory blocks, allowing direct offset calculation to locate any element in constant time O(1).",
  },
  {
    id: "fund-2",
    category: "fundamentals",
    categoryLabel: "Fundamentals",
    difficulty: "beginner",
    question:
      "Which data structure operates on a Last-In, First-Out (LIFO) order?",
    options: ["Queue", "Stack", "Binary Search Tree", "Hash Table"],
    correctAnswerIndex: 1,
    explanation:
      "A Stack pushes and pops items in a Last-In, First-Out (LIFO) order, similar to call stacks in program execution.",
  },

  // 2. JavaScript & TypeScript
  {
    id: "js-ts-1",
    category: "javascript-typescript",
    categoryLabel: "JavaScript & TypeScript",
    difficulty: "intermediate",
    question:
      "In TypeScript, what is the primary difference between the 'unknown' and 'any' types?",
    options: [
      "'unknown' disables all type checking just like 'any'",
      "'unknown' is type-safe and requires narrowing or type checking before performing operations on it",
      "'unknown' can only represent null or undefined values",
      "'any' requires explicit type assertions while 'unknown' does not",
    ],
    correctAnswerIndex: 1,
    explanation:
      "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to 'unknown', but TypeScript prevents operations on it until narrowed.",
  },
  {
    id: "js-ts-2",
    category: "javascript-typescript",
    categoryLabel: "JavaScript & TypeScript",
    difficulty: "intermediate",
    question:
      "In modern JavaScript, which task queue executes microtasks such as Promise resolution handlers (.then / catch)?",
    options: [
      "The Microtask Queue, which executes before the next event loop rendering and macrotask phase",
      "The Macrotask Queue, along with setTimeout and setInterval callbacks",
      "The Worker Thread Pool via background Web Workers",
      "The synchronous execution stack directly without queueing",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Promise callbacks and queueMicrotask run from the Microtask queue immediately after the current synchronous script finishes and before the next macrotask.",
  },
  {
    id: "js-ts-3",
    category: "javascript-typescript",
    categoryLabel: "JavaScript & TypeScript",
    difficulty: "beginner",
    question: "What is a JavaScript closure?",
    options: [
      "A mechanism to seal objects and prevent adding new properties",
      "A function combined with references to its surrounding lexical environment",
      "An asynchronous syntax wrapper using async and await",
      "A method for automatically terminating recursive function calls",
    ],
    correctAnswerIndex: 1,
    explanation:
      "A closure gives a function access to its outer scope even after that outer function has returned from execution.",
  },

  // 3. Python & Backend
  {
    id: "py-back-1",
    category: "python-backend",
    categoryLabel: "Python & Backend",
    difficulty: "intermediate",
    question: "What is the Global Interpreter Lock (GIL) in standard CPython?",
    options: [
      "A database locking protocol used by Python ORMs",
      "A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously",
      "A security sandbox feature that disables system file access",
      "A network firewall integrated into the Python socket library",
    ],
    correctAnswerIndex: 1,
    explanation:
      "CPython's GIL is a mutex designed to make memory management thread-safe by allowing only one native thread to execute Python bytecode at a time.",
  },
  {
    id: "py-back-2",
    category: "python-backend",
    categoryLabel: "Python & Backend",
    difficulty: "beginner",
    question:
      "In Python, what keyword transforms a standard function into a generator that yields values on demand?",
    options: ["return", "yield", "emit", "async"],
    correctAnswerIndex: 1,
    explanation:
      "The 'yield' keyword pauses function execution and returns an intermediate value, maintaining state across iterations as a generator iterator.",
  },
  {
    id: "py-back-3",
    category: "python-backend",
    categoryLabel: "Python & Backend",
    difficulty: "intermediate",
    question:
      "In asynchronous frameworks like FastAPI or Node.js, what is the primary benefit of asynchronous I/O over synchronous blocking I/O?",
    options: [
      "It speeds up CPU-intensive mathematical operations like image rendering",
      "It allows the single thread or worker to handle other incoming requests while waiting for network/database I/O to complete",
      "It eliminates the need for database indexing",
      "It automatically compiles Python or JavaScript into native machine code",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Non-blocking asynchronous I/O releases the event loop during network or disk waits, dramatically increasing request throughput without thread overhead.",
  },

  // 4. HTTP & REST APIs
  {
    id: "api-net-1",
    category: "apis-networking",
    categoryLabel: "APIs & Networking",
    difficulty: "beginner",
    question:
      "In RESTful HTTP design, which of the following HTTP methods is expected to be idempotent?",
    options: ["POST", "PUT", "PATCH (without precondition headers)", "CONNECT"],
    correctAnswerIndex: 1,
    explanation:
      "An idempotent method produces the same server state whether executed once or multiple identical times. PUT, GET, and DELETE are idempotent; standard POST is not.",
  },
  {
    id: "api-net-2",
    category: "apis-networking",
    categoryLabel: "APIs & Networking",
    difficulty: "beginner",
    question:
      "What is the semantic difference between HTTP 401 Unauthorized and HTTP 403 Forbidden?",
    options: [
      "401 means the client is unauthenticated (missing or invalid credentials), while 403 means the identity is known but access is not permitted",
      "401 is a server error while 403 is a client validation failure",
      "401 applies only to HTTPS while 403 is for HTTP",
      "401 indicates a rate limit exceeded while 403 indicates invalid JSON body",
    ],
    correctAnswerIndex: 0,
    explanation:
      "401 Unauthorized signals missing or invalid authentication credentials. 403 Forbidden indicates that authentication succeeded, but the user lacks permission for the resource.",
  },

  // 5. Databases
  {
    id: "db-1",
    category: "databases",
    categoryLabel: "Databases & SQL",
    difficulty: "intermediate",
    question:
      "In database transaction ACID properties, what does the 'I' (Isolation) guarantee?",
    options: [
      "Transactions are completely stored in independent isolated cloud regions",
      "Concurrent transactions execute without interfering with one another, preventing dirty reads or inconsistent states",
      "All indices are isolated into RAM cache",
      "Each table row possesses an isolated cryptographic checksum",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Isolation ensures that concurrent transactions occur independently without interference, preventing issues such as uncommitted dirty reads or race conditions.",
  },
  {
    id: "db-2",
    category: "databases",
    categoryLabel: "Databases & SQL",
    difficulty: "beginner",
    question:
      "What is the primary role of a Foreign Key constraint in a relational database?",
    options: [
      "To automatically encrypt sensitive customer data",
      "To enforce referential integrity between matching columns across two tables",
      "To enable full-text fuzzy string searching",
      "To bypass index checks for faster insert operations",
    ],
    correctAnswerIndex: 1,
    explanation:
      "A foreign key enforces referential integrity by ensuring that a value in one table corresponds to an existing valid primary or unique key in the referenced table.",
  },
  {
    id: "db-3",
    category: "databases",
    categoryLabel: "Databases & SQL",
    difficulty: "intermediate",
    question:
      "Why do relational databases commonly use B-Tree (or B+ Tree) structures for indexing tabular columns?",
    options: [
      "They store data as uncompressed binary blobs",
      "They maintain sorted order with logarithmic time O(log n) for lookups, range scans, inserts, and deletions with minimal disk I/O",
      "They eliminate the need for memory buffer pools",
      "They only function when all data fits inside CPU L1 cache",
    ],
    correctAnswerIndex: 1,
    explanation:
      "B-Trees maintain self-balancing sorted keys with high branching factors, minimizing expensive disk block reads for equality and range queries.",
  },

  // 6. Testing & Architecture
  {
    id: "test-arch-1",
    category: "testing-architecture",
    categoryLabel: "Testing & Architecture",
    difficulty: "beginner",
    question: "What distinguishes a Pure Function in software architecture?",
    options: [
      "It must be written in a functional language like Haskell",
      "Given the same inputs, it always returns the exact same output with no observable side effects",
      "It cannot take more than two function parameters",
      "It must execute asynchronously using Promises",
    ],
    correctAnswerIndex: 1,
    explanation:
      "A pure function is deterministic: identical inputs yield identical outputs, and it produces no side effects (such as modifying global variables or performing network I/O).",
  },
  {
    id: "test-arch-2",
    category: "testing-architecture",
    categoryLabel: "Testing & Architecture",
    difficulty: "beginner",
    question:
      "What is the core distinction between Unit Tests and Integration Tests?",
    options: [
      "Unit tests evaluate isolated modules or functions in isolation, while integration tests evaluate how multiple components collaborate",
      "Unit tests are executed by QA teams, whereas integration tests are written by compilers",
      "Unit tests require a live production database, whereas integration tests do not",
      "Unit tests only verify CSS and HTML layout",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Unit tests isolate individual functions or classes away from external dependencies, whereas integration tests verify interactions across subsystems and services.",
  },
  {
    id: "test-arch-3",
    category: "testing-architecture",
    categoryLabel: "Testing & Architecture",
    difficulty: "intermediate",
    question:
      "In system design, what does the principle of 'Idempotency' achieve for distributed network messaging?",
    options: [
      "It guarantees that messages travel at maximum theoretical optical speeds",
      "It ensures that delivering or processing a duplicate message multiple times produces the exact same outcome as processing it once",
      "It encrypts all network packets with asymmetrical public keys",
      "It forces all microservices to use the same programming language",
    ],
    correctAnswerIndex: 1,
    explanation:
      "In distributed systems with network retries (at-least-once delivery), idempotency prevents duplicate side-effects (e.g. charging a payment card twice).",
  },
];
