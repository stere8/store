namespace EStore.Api.Models;

public enum ReservationStatus
{
    Pending,    // waiting vendor
    Confirmed,  // vendor confirmed & holding item
    Completed,  // picked up & paid offline
    Rejected,   // cannot fulfill
    Cancelled   // by customer/system
}
