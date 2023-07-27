import { useState, useEffect } from 'react';

export default function UserWeightChecker(props) {

    const [loading, setLoading] = useState(false);
    const [weightData, setWeightData] = useState([]);
    const [formDataChanged, setFormDataChanged] = useState(false);
    const [formDateState, setFormDateState] = useState({
        startDate: getCurrentTime(),
        endDate: getCurrentTime(),
      });

    const fetchDateByRange = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                userId: props.elements.user._id,
                startDate: formDateState.startDate, 
                endDate: formDateState.endDate,
            });
            const response = await fetch('/weight/log?' + query.toString());
            const data = await response.json();
            setWeightData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDateByRange();
    }, []);

    const handleSearchSubmit = (evt) => {
        evt.preventDefault();
        if (formDateState.endDate < formDateState.startDate) {
            alert("End date cannot be before start date.");
            return;
        }
        else
            fetchDateByRange();
    }

    const handleDateChange = (event) => {
        const { name, value } = event.target;
        setFormDateState((prevState) => ({
          ...prevState,
          [name]: value,
        }));
        setFormDataChanged(true);
    };
    
    useEffect(() => {
        if (formDataChanged) {
          const debounceTimer = setTimeout(() => {
            fetchDateByRange();
          }, 500);
    
          return () => {
            clearTimeout(debounceTimer);
          };
        }
      }, [formDateState.startDate, formDateState.endDate]);

    function getCurrentTime() {
        const currentTime = new Date();
        const year = currentTime.getFullYear().toString();
        const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
        const day = currentTime.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const renderTable = () => {
      if (weightData.length === 0) {
        return <p>No weight data found.</p>;
      }
    
      // Find the lowest weight using the reduce function
      const lowestWeight = weightData.reduce((minWeight, w) => (w.weight < minWeight ? w.weight : minWeight), weightData[0].weight);
    
      return (
        <div className='container'>
          <div className="card">
            <div className="card-header">
              <h5>Weight Data</h5>
            </div>
            <div className="card-body">
              <div style={{ overflow: 'auto', maxHeight: '400px' }}>
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Weight</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightData.map((w) => (
                      <tr key={w._id}>
                        <td>{w.weight} kg</td>
                        <td>{w.date.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="container">
              <div className="row">
                <div className="col">
                  <div className="alert alert-info">
                    Your lowest weight is <strong>{lowestWeight}</strong> kg between <strong>{formDateState.startDate}</strong> to <strong>{formDateState.endDate}</strong>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className='container mt-4'>
      <h2>Weight Checker</h2>
        <form autoComplete="off" onSubmit={handleSearchSubmit} className="mb-4">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={formDateState.startDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group btn-margin">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  className="form-control btn-margin"
                  id="endDate"
                  name="endDate"
                  value={formDateState.endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            {loading ? <div>Loading...</div> : renderTable()}
          </div>
        </form>
      </div>
    );
}