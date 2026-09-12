window.REGISTER_PROBLEM({
  id: "sql-active-backlogs",
  title: "7. Active Backlogs",
  category: "SQL",
  tag: "HackerRank SQL",
  difficulty: "Easy",
  badgeColor: "green",
  language: "sql",
  summary: "Return a list of student names who have at least one occurrence of a backlog item.",
  description: `
    <h3>Problem Statement</h3>
    <p>Write a query to return a list of all students with at least one occurrence of a backlog item.</p>
    <p>The result should include <strong>only the student names</strong>.</p>

    <h3>Database Schema</h3>
    <p>There are 2 tables: <code>student</code> and <code>backlog</code>.</p>
    
    <div class="code-block">
TABLE student:
- ID (INTEGER): Unique ID, the primary key
- NAME (STRING): Student name

TABLE backlog:
- STUDENT_ID (INTEGER): Foreign key referencing student.id
- SUBJECT_ID (STRING): Subject ID
    </div>

    <h3>Sample Data Tables</h3>
    <div class="code-block">
student:
ID | NAME
1  | Chris
2  | Sam
3  | Alex

backlog:
STUDENT_ID | SUBJECT_ID
1          | abc123
3          | def456
    </div>

    <h3>Sample Output</h3>
    <div class="code-block">
Chris
Alex
    </div>
    <p><em>Explanation:</em> Chris (ID 1) and Alex (ID 3) both have entries in the backlog table. Sam (ID 2) has zero backlogs, so Sam is excluded.</p>
  `,
  starterCode: `-- Write your query to list student names with at least 1 backlog
-- Output column: NAME

SELECT 
`,
  optimalSolution: `SELECT DISTINCT s.name
FROM student s
JOIN backlog b ON s.id = b.student_id;
`,
  intuition: `
    <h3>The Trap: Forgetting DISTINCT</h3>
    <p>If Chris has <strong>3 backlogs</strong> in the backlog table, an ordinary <code>INNER JOIN</code> will match 3 times and print Chris's name 3 times!</p>
    <p>The problem asks for a list of student names, not repeated duplicates. Adding <strong><code>DISTINCT</code></strong> prevents the same student from appearing multiple times.</p>

    <h3>Alternative Solution: Subquery with IN or EXISTS</h3>
    <p>Instead of a JOIN with DISTINCT, you can also write:</p>
    <div class="code-block">
SELECT name
FROM student
WHERE id IN (SELECT student_id FROM backlog);
    </div>
    <p>Or using <code>EXISTS</code>:</p>
    <div class="code-block">
SELECT name
FROM student s
WHERE EXISTS (
    SELECT 1 FROM backlog b WHERE b.student_id = s.id
);
    </div>

    <h3>Interview Talking Point</h3>
    <p><em>"Using <code>WHERE EXISTS</code> or <code>IN</code> can often be faster on large production databases because the database engine can stop scanning the backlog table as soon as it finds the first match for a student, rather than generating a full joined result."</em></p>
  `,
  testCases: [
    {
      note: "HackerRank Sample Case (Chris and Alex qualify)",
      schemaSql: `
        CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT);
        CREATE TABLE backlog (student_id INTEGER, subject_id TEXT);
        INSERT INTO student VALUES 
          (1, 'Chris'), (2, 'Sam'), (3, 'Alex');
        INSERT INTO backlog VALUES 
          (1, 'abc123'), (3, 'def456'), (1, 'math999');
      `,
      expected: "Chris\nAlex"
    },
    {
      note: "All students have backlogs",
      schemaSql: `
        CREATE TABLE student (id INTEGER PRIMARY KEY, name TEXT);
        CREATE TABLE backlog (student_id INTEGER, subject_id TEXT);
        INSERT INTO student VALUES 
          (1, 'Jordan'), (2, 'Taylor');
        INSERT INTO backlog VALUES 
          (1, 'cs101'), (2, 'cs102');
      `,
      expected: "Jordan\nTaylor"
    }
  ],
  functionName: null
});
