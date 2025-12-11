using System.Text.Json;

public class EpisodesService : IEpisodesService
{
    private readonly IRickAndMortyClient _client;

    public EpisodesService(IRickAndMortyClient client)
    {
        _client = client;
    }

    public async Task<EpisodesPageDto> GetEpisodesAsync(int page)
    {
        var raw = await _client.GetEpisodesRawAsync(page);
        using var doc = JsonDocument.Parse(raw);

        var info = doc.RootElement.GetProperty("info");
        var results = doc.RootElement.GetProperty("results").EnumerateArray();

        var episodes = results.Select(r => new EpisodeDto
        {
            Id = r.GetProperty("id").GetInt32(),
            Name = r.GetProperty("name").GetString(),
            AirDate = r.GetProperty("air_date").GetString(),
            Episode = r.GetProperty("episode").GetString(),
            Characters = r.GetProperty("characters").EnumerateArray().Select(c => c.GetString()!).ToArray()
        }).ToList();

        return new EpisodesPageDto
        {
            Page = page,
            TotalPages = info.GetProperty("pages").GetInt32(),
            TotalResults = info.GetProperty("count").GetInt32(),
            Episodes = episodes
        };
    }
}
