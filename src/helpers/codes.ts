export const codes = {
    100: 'Continuar',
    101: 'Protocolos de conmutación',
    102: 'Procesando', // WebDAV; RFC 2518
    103: 'Sugerencias iniciales', // RFC 8297
    200: 'OK',
    201: 'Creado',
    202: 'Aceptado',
    203: 'Información no autorizada', // desde HTTP / 1.1
    204: 'Sin contenido',
    205: 'Restablecer contenido',
    206: 'Contenido parcial', // RFC 7233
    207: 'Varios estados', // WebDAV; RFC 4918
    208: 'Ya informado', // WebDAV; RFC 5842
    226: 'IM usado', // RFC 3229
    300: 'Opciones múltiples',
    301: 'Movido Permanentemente',
    302: 'Encontrado', // Anteriormente "Movido temporalmente"
    303: 'Ver otros', // desde HTTP / 1.1
    304: 'No modificado', // RFC 7232
    305: 'Use Proxy', // desde HTTP / 1.1
    306: 'Cambiar proxy',
    307: 'Redirección temporal', // desde HTTP / 1.1
    308: 'Redirección permanente', // RFC 7538
    400: 'Petición Incorrecta',
    401: 'No autorizado', // RFC 7235
    402: 'Pago requerido',
    403: 'Prohibido',
    404: 'No encontrado',
    405: 'Método no permitido',
    406: 'No aceptable',
    407: 'Se requiere autenticación de proxy', // RFC 7235
    408: 'Solicitar tiempo de espera',
    409: 'Conflicto',
    410: 'ido',
    411: 'Longitud requerida',
    412: 'Precondición fallida', // RFC 7232
    413: 'Carga útil demasiado grande', // RFC 7231
    414: 'URI demasiado largo', // RFC 7231
    415: 'Tipo de medio no admitido', // RFC 7231
    416: 'Rango no satisfactorio', // RFC 7233
    417: 'Expectativa fallida',
    418: 'Soy una tetera', // RFC 2324, RFC 7168
    421: 'Solicitud mal dirigida', // RFC 7540
    422: 'Entidad no procesable', // WebDAV; RFC 4918
    423: 'Bloqueado', // WebDAV; RFC 4918
    424: 'Dependencia fallida', // WebDAV; RFC 4918
    425: 'Demasiado pronto', // RFC 8470
    426: 'Actualización requerida',
    428: 'Requisito previo', // RFC 6585
    429: 'Demasiadas solicitudes', // RFC 6585
    431: 'Campos de encabezado de solicitud demasiado grandes', // RFC 6585
    451: 'No disponible por motivos legales', // RFC 7725 Error interno de servidor 500',
    501: 'No implementado',
    502: 'Puerta de enlace no válida',
    503: 'Servicio no Disponible',
    504: 'Tiempo de espera de la puerta de enlace',
    505: 'Versión HTTP no admitida',
    506: 'La variante también negocia', // RFC 2295
    507: 'Almacenamiento insuficiente', // WebDAV; RFC 4918
    508: 'Bucle detectado', // WebDAV; RFC 5842
    510: 'No extendido', // RFC 2774
    511: 'Se requiere autenticación de red', // RFC 6585
}