CREATE TABLE IF NOT EXISTS calculate_tree_config(
	configid VARCHAR(50) NOT NULL,
	appid VARCHAR(50) NOT NULL,
	createts BIGINT UNSIGNED NOT NULL,
	updatets BIGINT UNSIGNED NOT NULL,
	valid BOOL NOT NULL DEFAULT TRUE,
	PRIMARY KEY (configid)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE calculate_tree_config ADD INDEX appid_index (appid);

CREATE TABLE IF NOT EXISTS calculate_tree_config_json(
    configid VARCHAR(50) NOT NULL,
    config JSON,
    PRIMARY KEY (configid)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS calculate_instance_config(
    instanceid VARCHAR(50) NOT NULL,
    appid VARCHAR(50) NOT NULL,
    createts BIGINT UNSIGNED NOT NULL,
    updatets BIGINT UNSIGNED NOT NULL,
    valid BOOL NOT NULL DEFAULT TRUE,
    PRIMARY KEY (instanceid)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE calculate_instance_config ADD INDEX appid_index (appid);

CREATE TABLE IF NOT EXISTS calculate_instance_config_json(
    instanceid VARCHAR(50) NOT NULL,
    config JSON,
    PRIMARY KEY (instanceid)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS authorization_info(
    appid VARCHAR(50) NOT NULL,
    createts BIGINT UNSIGNED NOT NULL,
    valid BOOL NOT NULL DEFAULT TRUE,
    PRIMARY KEY (appid)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE IF NOT EXISTS tx_delegation(
    txid VARCHAR(66) NOT NULL,
    origin VARCHAR(42) NOT NULL,
    delegator VARCHAR(42) NOT NULL,
    gas BIGINT UNSIGNED NOT NULL,
    signts BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (txid)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE tx_delegation ADD INDEX origin_index (origin);
ALTER TABLE tx_delegation ADD INDEX delegater_index (delegator);

CREATE TABLE IF NOT EXISTS tx_delegation_clauses_index(
    txid VARCHAR(66) NOT NULL,
    clause_index INTEGER UNSIGNED NOT NULL,
    toaddress VARCHAR(42) NULL,
    amount VARCHAR(50) NOT NULL DEFAULT 0,
    data BLOB,
    PRIMARY KEY (txid)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE tx_delegation_clauses_index ADD INDEX toaddress_index (toaddress);
ALTER TABLE tx_delegation_clauses_index ADD UNIQUE toaddress_clauseindex_index (toaddress,clause_index);