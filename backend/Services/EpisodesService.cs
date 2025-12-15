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
        // Obtener episodios crudos
        var raw = await _client.GetEpisodesRawAsync(page);
        using var doc = JsonDocument.Parse(raw);

        var info = doc.RootElement.GetProperty("info");
        var results = doc.RootElement.GetProperty("results").EnumerateArray();

        // Parsear episodios y guardar URLs de personajes
        var episodesTemp = results.Select(r => new
        {
            Episode = new EpisodeDto
            {
                Id = r.GetProperty("id").GetInt32(),
                Name = r.GetProperty("name").GetString(),
                AirDate = r.GetProperty("air_date").GetString(),
                Episode = r.GetProperty("episode").GetString()
            },
            CharacterUrls = r.GetProperty("characters")
                .EnumerateArray()
                .Select(c => c.GetString()!)
                .ToList()
        }).ToList();

        // Resolver personajes SOLO si existen
        var allCharacterUrls = episodesTemp
            .SelectMany(e => e.CharacterUrls)
            .Distinct()
            .ToList();

        Dictionary<int, CharacterDto> charactersById = new();

        if (allCharacterUrls.Any())
        {
            var rawCharacters = await _client.GetCharactersRawAsync(allCharacterUrls);
            using var charDoc = JsonDocument.Parse(rawCharacters);

            var root = charDoc.RootElement;

            // La API devuelve objeto o array dependiendo del count
            if (root.ValueKind == JsonValueKind.Array)
            {
                foreach (var c in root.EnumerateArray())
                {
                    var dto = new CharacterDto
                    {
                        Id = c.GetProperty("id").GetInt32(),
                        Name = c.GetProperty("name").GetString(),
                        Status = c.GetProperty("status").GetString(),
                        Species = c.GetProperty("species").GetString(),
                        Gender = c.GetProperty("gender").GetString(),
                        Image = c.GetProperty("image").GetString()
                    };

                    charactersById[dto.Id] = dto;
                }
            }
            else if (root.ValueKind == JsonValueKind.Object)
            {
                var c = root;

                var dto = new CharacterDto
                {
                    Id = c.GetProperty("id").GetInt32(),
                    Name = c.GetProperty("name").GetString(),
                    Status = c.GetProperty("status").GetString(),
                    Species = c.GetProperty("species").GetString(),
                    Gender = c.GetProperty("gender").GetString(),
                    Image = c.GetProperty("image").GetString()
                };

                charactersById[dto.Id] = dto;
            }

        }

        // Asignar personajes a cada episodio
        foreach (var e in episodesTemp)
        {
            foreach (var url in e.CharacterUrls)
            {
                var id = int.Parse(url.Split('/').Last());

                if (charactersById.TryGetValue(id, out var character))
                {
                    e.Episode.Characters.Add(character);
                }
            }
        }

        return new EpisodesPageDto
        {
            Page = page,
            TotalPages = info.GetProperty("pages").GetInt32(),
            TotalResults = info.GetProperty("count").GetInt32(),
            Episodes = episodesTemp.Select(e => e.Episode).ToList()
        };
    }
}
