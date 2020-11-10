const queryStatement = [
  {
    name: `Población total`,
    query: `select count(1) AS total FROM empresa_17.Informe_sst order by total`,
    results: [],
    chart: false,
    column: 0
  },
  {
    name: `Población total evaluada`,
    query: `select count(1) AS total FROM empresa_17.Informe_sst where estado_cita_1=1 order by total`,
    results: [],
    chart: false,
    column: 0
  },
  {
    name: `Edad Promedio`,
    query: `select avg(edad_1) as total FROM empresa_17.Informe_sst where estado_cita_1=1 order by total`,
    results: [],
    chart: false,
    column: 0
  },
  {
    name: `Distribución porcentual según edad`,
    query: `SELECT 
                (CASE
                    WHEN (empresa_17.Informe_sst.Edad_1 BETWEEN 10 AND 19) THEN 'De 10 a 19'
                    WHEN (empresa_17.Informe_sst.Edad_1 BETWEEN 20 AND 29) THEN 'De 20 a 29'
                    WHEN (empresa_17.Informe_sst.Edad_1 BETWEEN 30 AND 39) THEN 'De 30 a 39'
                    WHEN (empresa_17.Informe_sst.Edad_1 >= 40) THEN 'De 40 o más'
                END) AS labels,
                COUNT(1) AS total
            FROM
                empresa_17.Informe_sst
            GROUP BY labels order by total`,
    results: [],
    chart: false,
    column: 0
  },
  {
    name: `Distribución porcentual según edad`,
    query: `SELECT 
                (CASE
                    WHEN (empresa_17.Informe_sst.Edad_1 BETWEEN 10 AND 19) THEN 'De 10 a 19'
                    WHEN (empresa_17.Informe_sst.Edad_1 BETWEEN 20 AND 29) THEN 'De 20 a 29'
                    WHEN (empresa_17.Informe_sst.Edad_1 BETWEEN 30 AND 39) THEN 'De 30 a 39'
                    WHEN (empresa_17.Informe_sst.Edad_1 >= 40) THEN 'De 40 o más'
                END) AS labels,
                COUNT(1) AS total
            FROM
                empresa_17.Informe_sst
            GROUP BY labels order by total`,
    results: [],
    chart: true,
    typeChart: 'pie',
    column: 1
  },
  {
    name: `Distribución porcentual según estado civil`,
    query: `select Estado_civil_1 AS labels, count(1)  AS total FROM empresa_17.Informe_sst where estado_cita_1=1  and Cliente_id_1 in (235, 236) group by Estado_civil_1 order by total`,
    results: [],
    chart: true,
    typeChart: 'bar',
    column: 1
  },
  {
    name: `Distribución porcentual según estado civil 2`,
    query: `select Estado_civil_1 AS labels, count(1)  AS total FROM empresa_17.Informe_sst where estado_cita_1=1  and Cliente_id_1 in (235, 236) group by Estado_civil_1 order by total`,
    results: [],
    chart: true,
    typeChart: 'pie',
    column: 1
  },
  {
    name: `Distribución porcentual según hábito de consumo de alcohol`,
    query: `select Consumo_alcohol_1 AS labels, count(1)  AS total  FROM empresa_17.Informe_sst where estado_cita_1=1 group by Consumo_alcohol_1 order by total`,
    results: [],
    chart: true,
    typeChart: 'bar',
    column: 1
  },
  {
    name: `Distribución porcentual según práctica de actividad física`,
    query: `select Hace_ejercicio_1 AS labels, count(1)  AS total  FROM empresa_17.Informe_sst where estado_cita_1=1 group by Hace_ejercicio_1 order by total`,
    results: [],
    chart: true,
    typeChart: 'pie',
    column: 2
  },
  {
    name: `Distribución porcentual según IMC`,
    query: `select Imc_interpretacion_1 AS labels, count(1)  AS total  FROM empresa_17.Informe_sst where estado_cita_1=1 group by Imc_interpretacion_1 order by total`,
    results: [],
    chart: true,
    typeChart: 'bar',
    column: 2
  },
  {
    name: `Distribución porcentual según hábito de fumar`,
    query: `select Fuma_1 AS labels, count(1)  AS total  FROM empresa_17.Informe_sst where estado_cita_1=1 group by Fuma_1 order by total`,
    results: [],
    chart: true,
    typeChart: 'bar',
    column: 2
  },
  {
    name: `Distribución porcentual según genero`,
    query: `SELECT genero_1 AS labels, count(1)  AS total FROM empresa_17.Informe_sst where estado_cita_1=1 group by genero_1 order by total`,
    results: [],
    chart: false
  }
];

module.exports  = { queryStatement };