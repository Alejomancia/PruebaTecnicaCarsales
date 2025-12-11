public class EpisodesPageDto
{
    public int Page { get; set; }
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }
    public List<EpisodeDto> Episodes { get; set; } = new();
}
