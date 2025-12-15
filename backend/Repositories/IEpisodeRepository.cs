public interface IEpisodeRepository
{
    Task<EpisodesPageDto> GetEpisodesAsync(int page);
}
