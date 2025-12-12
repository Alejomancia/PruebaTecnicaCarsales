using System.Net;
using System.Text.Json;

namespace backend.Middlewares
{
    // Middleware global para manejar errores de forma centralizada
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(
            RequestDelegate next,
            ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Continúa con la ejecución normal del pipeline
                await _next(context);
            }
            catch (ArgumentException ex)
            {
                // HTTP 400 - Error de validación de parámetros de entrada
                _logger.LogWarning(ex, "Solicitud inválida");

                await WriteErrorResponse(
                    context,
                    HttpStatusCode.BadRequest,
                    "La solicitud contiene parámetros inválidos"
                );
            }
            catch (KeyNotFoundException ex)
            {
                // HTTP 404 - Recurso solicitado no encontrado
                _logger.LogWarning(ex, "Recurso no encontrado");

                await WriteErrorResponse(
                    context,
                    HttpStatusCode.NotFound,
                    "No se encontró el recurso solicitado"
                );
            }
            catch (HttpRequestException ex)
            {
                // HTTP 502 - Error al consumir un servicio externo
                _logger.LogError(ex, "Error al consumir la API externa");

                await WriteErrorResponse(
                    context,
                    HttpStatusCode.BadGateway,
                    "Error al obtener información desde el servicio externo"
                );
            }
            catch (Exception ex)
            {
                // HTTP 500 - Error interno no controlado
                _logger.LogError(ex, "Error interno no controlado");

                await WriteErrorResponse(
                    context,
                    HttpStatusCode.InternalServerError,
                    "Ocurrió un error interno en el servidor"
                );
            }
        }

        private static async Task WriteErrorResponse(
            HttpContext context,
            HttpStatusCode statusCode,
            string message)
        {
            // Evita intentar escribir la respuesta si ya fue enviada
            if (context.Response.HasStarted)
            {
                return;
            }

            context.Response.Clear();
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            // Formato estándar de error consumido por el frontend
            var response = new
            {
                status = context.Response.StatusCode,
                mensaje = message
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response)
            );
        }
    }
}
