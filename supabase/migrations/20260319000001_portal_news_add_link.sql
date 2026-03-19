ALTER TABLE portal_news
  ADD COLUMN link_type TEXT NULL,
  ADD COLUMN link_item_id INTEGER NULL,
  ADD CONSTRAINT portal_news_link_type_check
    CHECK (link_type IS NULL OR link_type IN (
      'newsletter','mini-livro','biblioteca',
      'especial-semana','radar-oportunidades','estudar'
    ));
