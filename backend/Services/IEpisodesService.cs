public interface IEpisodesService
{
    Task<EpisodesPageDto> GetEpisodesAsync(int page);
}
