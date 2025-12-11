public interface IRickAndMortyClient
{
    Task<string> GetEpisodesRawAsync(int page);
}
