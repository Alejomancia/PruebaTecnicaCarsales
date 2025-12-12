using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EpisodesController : ControllerBase
    {
        private readonly IEpisodesService _service;

        public EpisodesController(IEpisodesService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1)
        {
            // Validación de parámetros
            if (page < 1)
            {
                return BadRequest(new { mensaje = "El parámetro page debe ser mayor o igual a 1" });
            }

            // Los errores se manejan en el middleware
            var result = await _service.GetEpisodesAsync(page);
            return Ok(result);
        }
    }
}
