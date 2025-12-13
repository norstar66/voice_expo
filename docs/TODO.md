1. Select needed hardware
	1. Mini-pc
		1. Hardware requirements
			1. 32gb RAM, 1TB SSD,  2+ PCIe slots, 
			2. micro-controller for SAS
			3. 2 24TB SAS drives for cloud
		2. Ubuntu flavor selection
			1. LTS is ideal
2. Minimal scripts we should define next
	1. Even before we choose Fastify vs Nest, these scripts set the rhythm:

- **`package.json` (top-level)**

- **`dev` (starts api + web)**
    
- **`db:migrate`**
    
- **`db:seed`**
    
- **`db:reset`**
    
- **`test:toast-fixtures`**
    
- **`backup:db`**
