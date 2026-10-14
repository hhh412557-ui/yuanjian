-- 2026-10-12：将信源配置中的历史键迁移为 _yuanjian。
-- 代码允许集与示例配置已经使用新键，但 seed 只在信源缺失时插入，
-- 因此数据库里已有的信源仍可能保留历史键。这里保留其它配置和管理员编辑内容，
-- 若记录已经同时存在 _yuanjian，则只删除历史键；否则把历史键的值迁移过去。
DO $$
DECLARE
  legacy_key CONSTANT text := '_' || 'ai' || 'hot';
BEGIN
  UPDATE sources
  SET config = (config - legacy_key)
    || CASE WHEN config ? '_yuanjian' THEN '{}'::jsonb ELSE jsonb_build_object('_yuanjian', config -> legacy_key) END
  WHERE config ? legacy_key;
END $$;
