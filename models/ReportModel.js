import db from "../configs/Database.js";

export const getReportBySupplierService = async (startDate, endDate) => {
  const query =
    "SELECT a.id, a.name,ifnull(total_payment_rent, 0) as total_payment_rent,ifnull(personal_cost_total, 0) as personal_cost_total, ifnull(cost_total, 0) as cost_total,ifnull(total_payment_rent, 0) - ifnull(personal_cost_total, 0) - ifnull(cost_total, 0) as netto,ifnull(total_real_payment_rent, 0) as total_real_payment_rent,ifnull(total_real_payment_rent, 0) - ifnull(personal_cost_total, 0) - ifnull(cost_total, 0) as real_netto FROM suppliers a left join (SELECT a.id, sum(d.total) as total_payment_rent  FROM suppliers a left join ownerships b on a.id=b.id_supplier left join transactions c on b.id=c.id_ownership left join payments d on c.id=d.id_transaction where d.createdAt between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' group by a.id) as b on a.id=b.id left join (SELECT a.id, sum(b.total) as personal_cost_total FROM suppliers a left join personal_costs b on a.id=b.id_supplier where b.personal_cost_date between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' group by a.id) as c on a.id=c.id left join (SELECT a.id, sum(c.total) as cost_total  FROM suppliers a left join ownerships b on a.id=b.id_supplier left join costs c on b.id=c.id_ownership where c.cost_date between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' group by a.id) as d on a.id=d.id left join (SELECT a.id, sum(d.total) as total_real_payment_rent  FROM suppliers a left join ownerships b on a.id=b.id_supplier left join transactions c on b.id=c.id_ownership left join payments d on c.id=d.id_transaction where d.createdAt between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' and c.time_out between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' group by a.id) as e on a.id=e.id";
  const [result, metadata] = await db.query(query);
  return result;
};

export const getReportByOwnershipService = async (startDate, endDate) => {
  const query =
    "SELECT a.id,id_supplier,code,licence_plate,b.name, b.phone, ifnull(total_payment_rent, 0) as total_payment_rent, ifnull(total_cost, 0) as total_cost, ifnull(total_payment_rent, 0) - ifnull(total_cost, 0) as netto,ifnull(total_real_payment_rent, 0) as total_real_payment_rent, ifnull(total_real_payment_rent, 0) - ifnull(total_cost, 0) as real_netto from ownerships a inner join suppliers b on a.id_supplier=b.id left join (SELECT a.id, sum(c.total) as total_payment_rent FROM ownerships a left join transactions b on a.id=b.id_ownership left join payments c on b.id=c.id_transaction where c.createdAt between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' group by a.id) c on a.id=c.id left join (SELECT a.id, sum(b.total) as total_cost FROM ownerships a left join costs b on a.id=b.id_ownership where b.cost_date between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' group by a.id) as d on a.id=d.id left join (SELECT a.id, sum(c.total) as total_real_payment_rent FROM ownerships a left join transactions b on a.id=b.id_ownership left join payments c on b.id=c.id_transaction where c.createdAt between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59'  and b.time_out between '" +
    startDate +
    " 00:00:00' AND '" +
    endDate +
    " 23:59:59' group by a.id) as e on a.id=e.id order by code";
  const [result, metadata] = await db.query(query);
  return result;
};
