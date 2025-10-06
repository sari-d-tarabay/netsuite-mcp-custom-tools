import query from 'N/query';
import ResultSet from 'N/query/resultSet';
import outsourcedWorkOrders from '../src/FileCabinet/SuiteScripts/outsourced_workorders_acp.js';
import { handleTestResultAndErrors } from './__utils__/handleErrors.js';

jest.mock('N/query');
jest.mock('N/query/resultSet');

global.log = {
	error: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe('getOutsourcedWorkOrders tests', () => {
	it('should return list of outsourced and firmed work orders', async () => {
		// given
		const EXPECTED_RESULT = [
			{
				id: '16306',
				tranid: 'WO81',
				trandate: '10/5/2025',
				assemblyitem: '508',
				quantity: '15',
				built: '0',
				firmed: 'T',
				outsourced: 'T',
				vendor: '622',
				linkedpo: '16406',
				startdate: '11/1/2025',
				enddate: '11/1/2025',
				location: '17',
				status: 'Released',
				memo: 'Test outsourced work order',
				outsourcingcharge: '500',
				assembly_itemid: '508',
				assembly_name: 'Bike Assembly',
				vendor_name: 'ABC Manufacturing',
				po_number: 'PO1234',
				po_date: '10/5/2025',
				po_status: 'Pending Receipt'
			},
			{
				id: '16307',
				tranid: 'WO82',
				trandate: '10/6/2025',
				assemblyitem: '509',
				quantity: '10',
				built: '0',
				firmed: 'T',
				outsourced: 'T',
				vendor: '623',
				linkedpo: '16407',
				startdate: '11/2/2025',
				enddate: '11/2/2025',
				location: '18',
				status: 'Released',
				memo: 'Another outsourced WO',
				outsourcingcharge: '750',
				assembly_itemid: '509',
				assembly_name: 'Frame Assembly',
				vendor_name: 'XYZ Vendor',
				po_number: 'PO1235',
				po_date: '10/6/2025',
				po_status: 'Pending Receipt'
			}
		];

		query.runSuiteQL.promise.mockReturnValue(ResultSet);
		ResultSet.asMappedResults.mockReturnValue(EXPECTED_RESULT);

		const params = {};

		// when
		let callResult = handleTestResultAndErrors(
			await outsourcedWorkOrders.getOutsourcedWorkOrders({ ...params })
		);

		// then
		expect(query.runSuiteQL.promise).toHaveBeenCalled();
		expect(callResult.data.totalCount).toBe(2);
		expect(callResult.data.workOrders).toHaveLength(2);
		
		// Verify first work order
		const firstWO = callResult.data.workOrders[0];
		expect(firstWO.workOrderId).toBe('16306');
		expect(firstWO.workOrderNumber).toBe('WO81');
		expect(firstWO.isFirmed).toBe(true);
		expect(firstWO.isOutsourced).toBe(true);
		expect(firstWO.linkedPONumber).toBe('PO1234');
		expect(firstWO.vendorName).toBe('ABC Manufacturing');
		expect(firstWO.workOrderUrl).toBe('/app/accounting/transactions/workord.nl?id=16306');
		expect(firstWO.purchaseOrderUrl).toBe('/app/accounting/transactions/purchord.nl?id=16406');
	});

	it('should filter by vendor ID when provided', async () => {
		// given
		const EXPECTED_RESULT = [
			{
				id: '16306',
				tranid: 'WO81',
				trandate: '10/5/2025',
				assemblyitem: '508',
				quantity: '15',
				built: '0',
				firmed: 'T',
				outsourced: 'T',
				vendor: '622',
				linkedpo: '16406',
				startdate: '11/1/2025',
				enddate: '11/1/2025',
				location: '17',
				status: 'Released',
				memo: 'Test outsourced work order',
				outsourcingcharge: '500',
				assembly_itemid: '508',
				assembly_name: 'Bike Assembly',
				vendor_name: 'ABC Manufacturing',
				po_number: 'PO1234',
				po_date: '10/5/2025',
				po_status: 'Pending Receipt'
			}
		];

		query.runSuiteQL.promise.mockReturnValue(ResultSet);
		ResultSet.asMappedResults.mockReturnValue(EXPECTED_RESULT);

		const params = {
			vendorId: '622'
		};

		// when
		let callResult = handleTestResultAndErrors(
			await outsourcedWorkOrders.getOutsourcedWorkOrders({ ...params })
		);

		// then
		expect(query.runSuiteQL.promise).toHaveBeenCalled();
		expect(callResult.data.totalCount).toBe(1);
		expect(callResult.data.workOrders[0].vendorId).toBe('622');
		expect(callResult.data.workOrders[0].vendorName).toBe('ABC Manufacturing');
	});

	it('should filter by date range when provided', async () => {
		// given
		const EXPECTED_RESULT = [
			{
				id: '16306',
				tranid: 'WO81',
				trandate: '10/5/2025',
				assemblyitem: '508',
				quantity: '15',
				built: '0',
				firmed: 'T',
				outsourced: 'T',
				vendor: '622',
				linkedpo: '16406',
				startdate: '11/1/2025',
				enddate: '11/1/2025',
				location: '17',
				status: 'Released',
				memo: null,
				outsourcingcharge: '500',
				assembly_itemid: '508',
				assembly_name: 'Bike Assembly',
				vendor_name: 'ABC Manufacturing',
				po_number: 'PO1234',
				po_date: '10/5/2025',
				po_status: 'Pending Receipt'
			}
		];

		query.runSuiteQL.promise.mockReturnValue(ResultSet);
		ResultSet.asMappedResults.mockReturnValue(EXPECTED_RESULT);

		const params = {
			startDate: '10/1/2025',
			endDate: '10/31/2025'
		};

		// when
		let callResult = handleTestResultAndErrors(
			await outsourcedWorkOrders.getOutsourcedWorkOrders({ ...params })
		);

		// then
		expect(query.runSuiteQL.promise).toHaveBeenCalled();
		expect(callResult.data.totalCount).toBe(1);
		expect(callResult.data.workOrders[0].workOrderDate).toBe('10/5/2025');
	});

	it('should return empty array when no work orders found', async () => {
		// given
		const EXPECTED_RESULT = [];

		query.runSuiteQL.promise.mockReturnValue(ResultSet);
		ResultSet.asMappedResults.mockReturnValue(EXPECTED_RESULT);

		const params = {
			vendorId: '999'
		};

		// when
		let callResult = handleTestResultAndErrors(
			await outsourcedWorkOrders.getOutsourcedWorkOrders({ ...params })
		);

		// then
		expect(query.runSuiteQL.promise).toHaveBeenCalled();
		expect(callResult.data.totalCount).toBe(0);
		expect(callResult.data.workOrders).toHaveLength(0);
	});
});

describe('getOutsourcedWorkOrderDetails tests', () => {
	it('should return detailed information for a specific work order', async () => {
		// given
		const EXPECTED_RESULT = [
			{
				id: '16306',
				tranid: 'WO81',
				trandate: '10/5/2025',
				assemblyitem: '508',
				quantity: '15',
				built: '0',
				firmed: 'T',
				outsourced: 'T',
				vendor: '622',
				linkedpo: '16406',
				startdate: '11/1/2025',
				enddate: '11/1/2025',
				location: '17',
				status: 'Released',
				memo: 'Test outsourced work order',
				outsourcingcharge: '500',
				createddate: '10/5/2025 10:50 am',
				lastmodifieddate: '10/5/2025 10:55 am',
				assembly_itemid: '508',
				assembly_name: 'Bike Assembly',
				assembly_description: 'Complete bike assembly with frame',
				vendor_name: 'ABC Manufacturing',
				vendor_email: 'orders@abcmfg.com',
				po_number: 'PO1234',
				po_date: '10/5/2025',
				po_status: 'Pending Receipt',
				po_total: '7500.00',
				location_name: 'Boston - Half Outsourced'
			}
		];

		query.runSuiteQL.promise.mockReturnValue(ResultSet);
		ResultSet.asMappedResults.mockReturnValue(EXPECTED_RESULT);

		const params = {
			workOrderId: '16306'
		};

		// when
		let callResult = handleTestResultAndErrors(
			await outsourcedWorkOrders.getOutsourcedWorkOrderDetails({ ...params })
		);

		// then
		expect(query.runSuiteQL.promise).toHaveBeenCalled();
		expect(callResult.data.workOrderId).toBe('16306');
		expect(callResult.data.workOrderNumber).toBe('WO81');
		expect(callResult.data.isFirmed).toBe(true);
		expect(callResult.data.isOutsourced).toBe(true);
		expect(callResult.data.linkedPONumber).toBe('PO1234');
		expect(callResult.data.linkedPOTotal).toBe('7500.00');
		expect(callResult.data.vendorEmail).toBe('orders@abcmfg.com');
		expect(callResult.data.locationName).toBe('Boston - Half Outsourced');
		expect(callResult.data.assemblyDescription).toBe('Complete bike assembly with frame');
		expect(callResult.data.workOrderUrl).toBe('/app/accounting/transactions/workord.nl?id=16306');
		expect(callResult.data.purchaseOrderUrl).toBe('/app/accounting/transactions/purchord.nl?id=16406');
	});

	it('should return error when work order ID is missing', async () => {
		// given
		const params = {};

		// when
		let callResult = await outsourcedWorkOrders.getOutsourcedWorkOrderDetails({ ...params });

		// then
		expect(callResult.error).toBe('Missing work order ID');
		expect(query.runSuiteQL.promise).not.toHaveBeenCalled();
	});

	it('should return error when work order is not found', async () => {
		// given
		const EXPECTED_RESULT = [];

		query.runSuiteQL.promise.mockReturnValue(ResultSet);
		ResultSet.asMappedResults.mockReturnValue(EXPECTED_RESULT);

		const params = {
			workOrderId: '99999'
		};

		// when
		let callResult = await outsourcedWorkOrders.getOutsourcedWorkOrderDetails({ ...params });

		// then
		expect(query.runSuiteQL.promise).toHaveBeenCalled();
		expect(callResult.error).toBe('No Work Order found with id 99999');
	});

	it('should handle work order without linked PO', async () => {
		// given
		const EXPECTED_RESULT = [
			{
				id: '16308',
				tranid: 'WO83',
				trandate: '10/7/2025',
				assemblyitem: '508',
				quantity: '5',
				built: '0',
				firmed: 'T',
				outsourced: 'T',
				vendor: '622',
				linkedpo: null,
				startdate: '11/3/2025',
				enddate: '11/3/2025',
				location: '17',
				status: 'Released',
				memo: 'WO without linked PO',
				outsourcingcharge: '250',
				createddate: '10/7/2025 9:00 am',
				lastmodifieddate: '10/7/2025 9:05 am',
				assembly_itemid: '508',
				assembly_name: 'Bike Assembly',
				assembly_description: 'Complete bike assembly',
				vendor_name: 'ABC Manufacturing',
				vendor_email: 'orders@abcmfg.com',
				po_number: null,
				po_date: null,
				po_status: null,
				po_total: null,
				location_name: 'Boston - Half Outsourced'
			}
		];

		query.runSuiteQL.promise.mockReturnValue(ResultSet);
		ResultSet.asMappedResults.mockReturnValue(EXPECTED_RESULT);

		const params = {
			workOrderId: '16308'
		};

		// when
		let callResult = handleTestResultAndErrors(
			await outsourcedWorkOrders.getOutsourcedWorkOrderDetails({ ...params })
		);

		// then
		expect(query.runSuiteQL.promise).toHaveBeenCalled();
		expect(callResult.data.linkedPurchaseOrderId).toBeNull();
		expect(callResult.data.linkedPONumber).toBeNull();
		expect(callResult.data.purchaseOrderUrl).toBeNull();
	});
});