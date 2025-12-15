public interface IRickAndMortyClient
{
    Task<string> GetEpisodesRawAsync(int page);
    Task<string> GetCharactersRawAsync(IEnumerable<string> urls);
}
