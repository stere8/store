namespace EStore.Api.Models
{
    public class Category
    {
        public Guid Id { get; set; }
        public string TenantId { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public Category? ParentCategory { get; set; }
        public ICollection<CategoryField> Fields { get; set; } = new List<CategoryField>();
        public bool Active { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

}
