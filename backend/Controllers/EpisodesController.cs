using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EpisodesController : ControllerBase
    {
        private readonly IEpisodesService _service;
        private readonly ILogger<EpisodesController> _logger;

        public EpisodesController(IEpisodesService service, ILogger<EpisodesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1)
        {
            if (page < 1) return BadRequest(new { message = "page must be >= 1" });

            try
            {
                var result = await _service.GetEpisodesAsync(page);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error calling external API");
                return StatusCode(502, new { message = "Error fetching external API" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
