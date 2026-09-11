window.REGISTER_PROBLEM({
  id: "sql-properties-owned",
  title: "6. Value of Properties Owned",
  category: "SQL",
  tag: "HackerRank SQL",
  difficulty: "Medium",
  badgeColor: "purple",
  language: "sql",
  summary: "Find owners who have more than 100M total house value AND own more than 1 house using JOIN and HAVING.",
  description: `
    <h3>Problem Statement</h3>
    <p>Write a query to print the IDs of owners who have <strong>more than 100 million</strong> worth of houses and own <strong>more than 1 house</strong>.</p>
    <p>The result should be in the format: <code>BUYER_ID TOTAL_WORTH</code>.</p>

    <h3>Database Schema</h3>
    <p>There are 2 tables: <code>house</code> and <code>price</code>.</p>
    
    <div class="code-block">
TABLE house:
- BUYER_ID (INTEGER): Unique buyer ID
- HOUSE_ID (STRING): Unique house ID

TABLE price:
- HOUSE_ID (STRING): Unique house ID. Primary key.
- PRICE (INTEGER): The price of the house.
    </div>

    <h3>Sample Data Tables</h3>
    <div class="code-block">
house:
BUYER_ID | HOUSE_ID
1        | abc123
2        | def456
3        | abc456
1        | def123
2        | def789

price:
HOUSE_ID | PRICE
abc123   | 70000000
def123   | 50000000
def456   | 30000000
def789   | 40000000
abc456   | 150000000
    </div>

    <h3>Sample Output</h3>
    <div class="code-block">
1 120000000
    </div>
    <p><em>Explanation:</em></p>
    <ul>
      <li>Buyer 1 owns 2 houses (<code>abc123</code> + <code>def123</code>) worth <code>70M + 50M = 120M</code>. Both conditions pass!</li>
      <li>Buyer 2 owns 2 houses (<code>def456</code> + <code>def789</code>) worth <code>30M + 40M = 70M</code>. Total worth is &le; 100M, so fails.</li>
      <li>Buyer 3 has 150M worth, but only owns 1 house (count is not > 1). So fails.</li>
    </ul>
  `,
  starterCode: `-- Write your query to find owners with > 100M worth and > 1 house
-- Expected output columns: BUYER_ID, TOTAL_WORTH

SELECT 
`,
  optimalSolution: `SELECT 
    h.buyer_id, 
    SUM(p.price) AS total_worth
FROM house h
JOIN price p ON h.house_id = p.house_id
GROUP BY h.buyer_id
HAVING COUNT(h.house_id) > 1 
   AND SUM(p.price) > 100000000;
`,
  intuition: `
    <h3>Why WHERE doesn't work here (and why you need HAVING)</h3>
    <p>In SQL, <code>WHERE</code> filters individual rows <em>before</em> grouping. You cannot write <code>WHERE SUM(price) > 100000000</code> because the database doesn't know the sum until after it groups!</p>
    <p>To filter aggregated values (like sums or counts for each buyer), you must use <strong><code>HAVING</code></strong> right after your <code>GROUP BY</code> clause.</p>

    <h3>Step-by-Step Breakdown</h3>
    <ol>
      <li><strong>JOIN the tables:</strong> Connect <code>house</code> and <code>price</code> on <code>house_id</code> so each buyer's house has its price attached.</li>
      <li><strong>GROUP BY buyer_id:</strong> Bundle all houses belonging to the same owner into a single row.</li>
      <li><strong>HAVING clause:</strong> Apply the two filter criteria together:
        <ul>
          <li><code>COUNT(h.house_id) > 1</code> (owns more than 1 house)</li>
          <li><code>SUM(p.price) > 100000000</code> (total value over 100 million)</li>
        </ul>
      </li>
    </ol>

    <h3>Interview Pro-Tip</h3>
    <p><em>If the interviewer asks: "What if a buyer owns the same house twice in the table by mistake?", tell them you'd use <code>COUNT(DISTINCT h.house_id) > 1</code> to ensure only unique houses are counted!</em></p>
  `,
  testCases: [
    {
      note: "HackerRank Sample Case (Buyer 1 qualifies)",
      schemaSql: `
        CREATE TABLE house (buyer_id INTEGER, house_id TEXT);
        CREATE TABLE price (house_id TEXT PRIMARY KEY, price INTEGER);
        INSERT INTO house VALUES 
          (1, 'abc123'), (2, 'def456'), (3, 'abc456'), (1, 'def123'), (2, 'def789');
        INSERT INTO price VALUES
          ('abc123', 70000000), ('def123', 50000000), ('def456', 30000000), ('def789', 40000000), ('abc456', 150000000);
      `,
      expected: "1 120000000"
    },
    {
      note: "Multiple qualifying owners (Buyer 10 and 20 qualify)",
      schemaSql: `
        CREATE TABLE house (buyer_id INTEGER, house_id TEXT);
        CREATE TABLE price (house_id TEXT PRIMARY KEY, price INTEGER);
        INSERT INTO house VALUES 
          (10, 'h1'), (10, 'h2'), (20, 'h3'), (20, 'h4'), (20, 'h5'), (30, 'h6');
        INSERT INTO price VALUES
          ('h1', 60000000), ('h2', 50000000), ('h3', 40000000), ('h4', 40000000), ('h5', 30000000), ('h6', 200000000);
      `,
      expected: "10 110000000\n20 110000000"
    }
  ],
  functionName: null
});
