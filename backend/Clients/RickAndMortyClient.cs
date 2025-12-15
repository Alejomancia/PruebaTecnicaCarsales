using System.Net.Http;
using System.Threading.Tasks;

public class RickAndMortyClient : IRickAndMortyClient
{
    private readonly IHttpClientFactory _httpClientFactory;

    public RickAndMortyClient(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> GetEpisodesRawAsync(int page)
    {
        var client = _httpClientFactory.CreateClient("RickAndMorty");
        var resp = await client.GetAsync($"episode?page={page}");
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadAsStringAsync();
    }

    public async Task<string> GetCharactersRawAsync(IEnumerable<string> urls)
{
    var client = _httpClientFactory.CreateClient("RickAndMorty");

    // Rick & Morty API permite batch por IDs
    var ids = urls
        .Select(u => u.Split('/').Last())
        .Distinct();

    var resp = await client.GetAsync($"character/{string.Join(",", ids)}");
    resp.EnsureSuccessStatusCode();

    return await resp.Content.ReadAsStringAsync();
}

}
