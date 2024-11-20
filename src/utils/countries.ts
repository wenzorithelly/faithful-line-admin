interface Country {
  code: string;
  name_en: string;
  name_pt: string;
  dial_code: string;
  phone_mask: string;
}

const countries: Country[] = [
    // North and Central America
    {
        code: 'US',
        name_en: 'United States',
        name_pt: 'Estados Unidos',
        dial_code: '1',
        phone_mask: '(999) 999-9999'
    },
    {
        code: 'CA',
        name_en: 'Canada',
        name_pt: 'Canadá',
        dial_code: '1',
        phone_mask: '(999) 999-9999'
    },
    {
        code: 'MX',
        name_en: 'Mexico',
        name_pt: 'México',
        dial_code: '52',
        phone_mask: '999-999-9999'
    },
    {
        code: 'BR',
        name_en: 'Brazil',
        name_pt: 'Brasil',
        dial_code: '55',
        phone_mask: '(99) 99999-9999'
    },
    {
        code: 'AR',
        name_en: 'Argentina',
        name_pt: 'Argentina',
        dial_code: '54',
        phone_mask: '9999-9999-9999'
    },
    {
        code: 'CL',
        name_en: 'Chile',
        name_pt: 'Chile',
        dial_code: '56',
        phone_mask: '9 999 999 999'
    },
    {
        code: 'CO',
        name_en: 'Colombia',
        name_pt: 'Colômbia',
        dial_code: '57',
        phone_mask: '999 999 9999'
    },
    {
        code: 'PE',
        name_en: 'Peru',
        name_pt: 'Peru',
        dial_code: '51',
        phone_mask: '9999-9999'
    },
    {
        code: 'VE',
        name_en: 'Venezuela',
        name_pt: 'Venezuela',
        dial_code: '58',
        phone_mask: '9999-9999'
    },
    {
        code: 'EC',
        name_en: 'Ecuador',
        name_pt: 'Equador',
        dial_code: '593',
        phone_mask: '99 999 9999'
    },
    {
        code: 'BO',
        name_en: 'Bolivia',
        name_pt: 'Bolívia',
        dial_code: '591',
        phone_mask: '999 999999'
    },
    {
        code: 'PY',
        name_en: 'Paraguay',
        name_pt: 'Paraguai',
        dial_code: '595',
        phone_mask: '9999-9999'
    },
    {
        code: 'UY',
        name_en: 'Uruguay',
        name_pt: 'Uruguai',
        dial_code: '598',
        phone_mask: '99 9999-9999'
    },
    {
        code: 'GY',
        name_en: 'Guyana',
        name_pt: 'Guiana',
        dial_code: '592',
        phone_mask: '999-9999'
    },
    {
        code: 'SR',
        name_en: 'Suriname',
        name_pt: 'Suriname',
        dial_code: '597',
        phone_mask: '999-9999'
    },
    {
        code: 'GT',
        name_en: 'Guatemala',
        name_pt: 'Guatemala',
        dial_code: '502',
        phone_mask: '9999-9999'
    },
    {
        code: 'HN',
        name_en: 'Honduras',
        name_pt: 'Honduras',
        dial_code: '504',
        phone_mask: '9999-9999'
    },
    {
        code: 'NI',
        name_en: 'Nicaragua',
        name_pt: 'Nicarágua',
        dial_code: '505',
        phone_mask: '9999-9999'
    },
    {
        code: 'CR',
        name_en: 'Costa Rica',
        name_pt: 'Costa Rica',
        dial_code: '506',
        phone_mask: '9999-9999'
    },
    {
        code: 'PA',
        name_en: 'Panama',
        name_pt: 'Panamá',
        dial_code: '507',
        phone_mask: '9999-9999'
    },
    {
        code: 'BZ',
        name_en: 'Belize',
        name_pt: 'Belize',
        dial_code: '501',
        phone_mask: '999-9999'
    },
    {
        code: 'SV',
        name_en: 'El Salvador',
        name_pt: 'El Salvador',
        dial_code: '503',
        phone_mask: '9999-9999'
    },
    {
        code: 'DO',
        name_en: 'Dominican Republic',
        name_pt: 'República Dominicana',
        dial_code: '1-809,1-829,1-849',
        phone_mask: '(999) 999-9999' // Multiple dial codes share the same format
    },
    {
        code: 'HT',
        name_en: 'Haiti',
        name_pt: 'Haiti',
        dial_code: '509',
        phone_mask: '999-9999'
    },
    {
        code: 'JM',
        name_en: 'Jamaica',
        name_pt: 'Jamaica',
        dial_code: '1-876',
        phone_mask: '999-9999'
    },
    {
        code: 'CU',
        name_en: 'Cuba',
        name_pt: 'Cuba',
        dial_code: '53',
        phone_mask: '999-9999'
    },

    // European Countries
    {
        code: 'AL',
        name_en: 'Albania',
        name_pt: 'Albânia',
        dial_code: '355',
        phone_mask: '99 999 9999'
    },
    {
        code: 'AD',
        name_en: 'Andorra',
        name_pt: 'Andorra',
        dial_code: '376',
        phone_mask: '999 999'
    },
    {
        code: 'AT',
        name_en: 'Austria',
        name_pt: 'Áustria',
        dial_code: '43',
        phone_mask: '9999 9999'
    },
    {
        code: 'BY',
        name_en: 'Belarus',
        name_pt: 'Bielorrússia',
        dial_code: '375',
        phone_mask: '99 999-99-99'
    },
    {
        code: 'BE',
        name_en: 'Belgium',
        name_pt: 'Bélgica',
        dial_code: '32',
        phone_mask: '999 99 99 99'
    },
    {
        code: 'BA',
        name_en: 'Bosnia and Herzegovina',
        name_pt: 'Bósnia e Herzegovina',
        dial_code: '387',
        phone_mask: '999 999 999'
    },
    {
        code: 'BG',
        name_en: 'Bulgaria',
        name_pt: 'Bulgária',
        dial_code: '359',
        phone_mask: '99 999 9999'
    },
    {
        code: 'HR',
        name_en: 'Croatia',
        name_pt: 'Croácia',
        dial_code: '385',
        phone_mask: '999 999 999'
    },
    {
        code: 'CY',
        name_en: 'Cyprus',
        name_pt: 'Chipre',
        dial_code: '357',
        phone_mask: '9999 999'
    },
    {
        code: 'CZ',
        name_en: 'Czech Republic',
        name_pt: 'República Tcheca',
        dial_code: '420',
        phone_mask: '999 999 999'
    },
    {
        code: 'DK',
        name_en: 'Denmark',
        name_pt: 'Dinamarca',
        dial_code: '45',
        phone_mask: '999 999 999'
    },
    {
        code: 'EE',
        name_en: 'Estonia',
        name_pt: 'Estônia',
        dial_code: '372',
        phone_mask: '999 9999'
    },
    {
        code: 'FI',
        name_en: 'Finland',
        name_pt: 'Finlândia',
        dial_code: '358',
        phone_mask: '999 999 999'
    },
    {
        code: 'FR',
        name_en: 'France',
        name_pt: 'França',
        dial_code: '33',
        phone_mask: '99 99 99 99 99'
    },
    {
        code: 'DE',
        name_en: 'Germany',
        name_pt: 'Alemanha',
        dial_code: '49',
        phone_mask: '9999 99999999'
    },
    {
        code: 'GR',
        name_en: 'Greece',
        name_pt: 'Grécia',
        dial_code: '30',
        phone_mask: '999 999 9999'
    },
    {
        code: 'HU',
        name_en: 'Hungary',
        name_pt: 'Hungria',
        dial_code: '36',
        phone_mask: '999 999 999'
    },
    {
        code: 'IS',
        name_en: 'Iceland',
        name_pt: 'Islândia',
        dial_code: '354',
        phone_mask: '999 9999'
    },
    {
        code: 'IE',
        name_en: 'Ireland',
        name_pt: 'Irlanda',
        dial_code: '353',
        phone_mask: '999 999999'
    },
    {
        code: 'IT',
        name_en: 'Italy',
        name_pt: 'Itália',
        dial_code: '39',
        phone_mask: '999 999 9999'
    },
    {
        code: 'LV',
        name_en: 'Latvia',
        name_pt: 'Letônia',
        dial_code: '371',
        phone_mask: '999 999 99'
    },
    {
        code: 'LI',
        name_en: 'Liechtenstein',
        name_pt: 'Liechtenstein',
        dial_code: '423',
        phone_mask: '9999 9999'
    },
    {
        code: 'LT',
        name_en: 'Lithuania',
        name_pt: 'Lituânia',
        dial_code: '370',
        phone_mask: '999 999999'
    },
    {
        code: 'LU',
        name_en: 'Luxembourg',
        name_pt: 'Luxemburgo',
        dial_code: '352',
        phone_mask: '999 999 999'
    },
    {
        code: 'MT',
        name_en: 'Malta',
        name_pt: 'Malta',
        dial_code: '356',
        phone_mask: '999 9999'
    },
    {
        code: 'MD',
        name_en: 'Moldova',
        name_pt: 'Moldávia',
        dial_code: '373',
        phone_mask: '999 999'
    },
    {
        code: 'MC',
        name_en: 'Monaco',
        name_pt: 'Mônaco',
        dial_code: '377',
        phone_mask: '999 999'
    },
    {
        code: 'ME',
        name_en: 'Montenegro',
        name_pt: 'Montenegro',
        dial_code: '382',
        phone_mask: '999 999 999'
    },
    {
        code: 'NL',
        name_en: 'Netherlands',
        name_pt: 'Países Baixos',
        dial_code: '31',
        phone_mask: '999 999 999'
    },
    {
        code: 'MK',
        name_en: 'North Macedonia',
        name_pt: 'Macedônia do Norte',
        dial_code: '389',
        phone_mask: '999 999 999'
    },
    {
        code: 'NO',
        name_en: 'Norway',
        name_pt: 'Noruega',
        dial_code: '47',
        phone_mask: '999 999 999'
    },
    {
        code: 'PL',
        name_en: 'Poland',
        name_pt: 'Polônia',
        dial_code: '48',
        phone_mask: '999 999 999'
    },
    {
        code: 'PT',
        name_en: 'Portugal',
        name_pt: 'Portugal',
        dial_code: '351',
        phone_mask: '999 999 999'
    },
    {
        code: 'RO',
        name_en: 'Romania',
        name_pt: 'Romênia',
        dial_code: '40',
        phone_mask: '999 999 999'
    },
    {
        code: 'RU',
        name_en: 'Russia',
        name_pt: 'Rússia',
        dial_code: '7',
        phone_mask: '999 999-99-99'
    },
    {
        code: 'SM',
        name_en: 'San Marino',
        name_pt: 'San Marino',
        dial_code: '378',
        phone_mask: '999 999 999'
    },
    {
        code: 'RS',
        name_en: 'Serbia',
        name_pt: 'Sérvia',
        dial_code: '381',
        phone_mask: '999 999 999'
    },
    {
        code: 'SK',
        name_en: 'Slovakia',
        name_pt: 'Eslováquia',
        dial_code: '421',
        phone_mask: '999 999 999'
    },
    {
        code: 'SI',
        name_en: 'Slovenia',
        name_pt: 'Eslovênia',
        dial_code: '386',
        phone_mask: '999 999 999'
    },
    {
        code: 'ES',
        name_en: 'Spain',
        name_pt: 'Espanha',
        dial_code: '34',
        phone_mask: '999 999 999'
    },
    {
        code: 'SE',
        name_en: 'Sweden',
        name_pt: 'Suécia',
        dial_code: '46',
        phone_mask: '999 999 999'
    },
    {
        code: 'CH',
        name_en: 'Switzerland',
        name_pt: 'Suíça',
        dial_code: '41',
        phone_mask: '999 999 999'
    },
    {
        code: 'TR',
        name_en: 'Turkey',
        name_pt: 'Turquia',
        dial_code: '90',
        phone_mask: '999 999 9999'
    },
    {
        code: 'UA',
        name_en: 'Ukraine',
        name_pt: 'Ucrânia',
        dial_code: '380',
        phone_mask: '999 999 999'
    },
    {
        code: 'GB',
        name_en: 'United Kingdom',
        name_pt: 'Reino Unido',
        dial_code: '44',
        phone_mask: '9999 999 9999'
    },
    {
        code: 'VA',
        name_en: 'Vatican City',
        name_pt: 'Vaticano',
        dial_code: '379',
        phone_mask: '999 999 999'
    },

    // Add more countries as needed
];


export default countries