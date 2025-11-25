-- Quick test to verify AI tables exist in NEW database
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND (table_name LIKE '%ai%' OR table_name LIKE '%investor%' OR table_name LIKE '%revenue%' OR table_name LIKE '%lead%' OR table_name LIKE '%growth%')
ORDER BY table_name;
