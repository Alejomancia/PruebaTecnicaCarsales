public class EpisodeDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? AirDate { get; set; }
    public string? Episode { get; set; }
    public List<CharacterDto> Characters { get; set; } = new();
}
