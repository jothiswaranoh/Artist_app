module Dashboard
  class BaseStatsService
    def initialize(user)
      @user = user
    end

    def call
      raise NotImplementedError
    end

    protected

    attr_reader :user

    def aggregate_booking_stats(query, extra_filters = {})
      relation = query.except(:select, :order)

      select_parts = ["COUNT(*) AS total_bookings"]

      Booking::STATUSES.each do |status|
        select_parts << "COUNT(*) FILTER (WHERE status = '#{status}') AS #{status}_bookings"
      end

      # Extra calculations
      extra_filters.each do |key, (condition, *args)|
        sanitized = Booking.send(:sanitize_sql_array, [condition, *args])
        select_parts << "COUNT(*) FILTER (WHERE #{sanitized}) AS #{key}"
      end

      relation
        .select(select_parts.join(', '))
        .take
        &.attributes
        &.symbolize_keys || {}
    end

    def sum_revenue(query)
      Payment.joins(:booking).merge(query.except(:select, :order)).sum(:amount).to_f
    end
  end
end
