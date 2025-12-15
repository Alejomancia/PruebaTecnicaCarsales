public class EpisodesService : IEpisodesService
{
    private readonly IEpisodeRepository _repository;

    public EpisodesService(IEpisodeRepository repository)
    {
        _repository = repository;
    }

    public Task<EpisodesPageDto> GetEpisodesAsync(int page)
    {
        return _repository.GetEpisodesAsync(page);
    }
}
