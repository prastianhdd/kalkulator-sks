import { useState, useEffect } from 'react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaSyncAlt } from 'react-icons/fa';

const gradePoints = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D': 1.0,
  'E': 0.0,
};

const getMaxSks = (ipSemester) => {
  if (ipSemester > 3.00) return 24;
  if (ipSemester >= 2.50) return 21;
  if (ipSemester >= 2.00) return 18;
  if (ipSemester >= 1.5) return 15;
  return 12;
};

function App() {
  
  const loadFromStorage = (key, defaultValue) => {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  };

  const [previousData, setPreviousData] = useState(
    loadFromStorage('previousData', { ipk: '0', sks: '0' })
  );

  const [courses, setCourses] = useState(
    loadFromStorage('coursesData', [
      { id: 1, name: '', sks: '3', grade: 'A' }, 
    ])
  );
  
  const [results, setResults] = useState({
    ipSemester: 0.0,
    ipkTotal: 0.0,
    maxSks: 12,
  });


  useEffect(() => {
    localStorage.setItem('previousData', JSON.stringify(previousData));
    calculateResults();
  }, [previousData]);

  useEffect(() => {
    localStorage.setItem('coursesData', JSON.stringify(courses));
    calculateResults();
  }, [courses]);

  // --- FUNGSI KALKULASI UTAMA ---

  const calculateResults = () => {
    let totalPointsSemester = 0;
    let totalSksSemester = 0;

    courses.forEach((course) => {
      const sks = parseInt(course.sks, 10);
      const point = gradePoints[course.grade]; 

      if (!isNaN(sks) && sks > 0 && point !== undefined) {
        totalPointsSemester += point * sks;
        totalSksSemester += sks;
      }
    });

    const ipSemester = totalSksSemester === 0 ? 0 : totalPointsSemester / totalSksSemester;
    const prevIpk = parseFloat(previousData.ipk) || 0;
    const prevSks = parseInt(previousData.sks, 10) || 0;
    const totalPointsPrev = prevIpk * prevSks;
    const totalPointsAll = totalPointsPrev + totalPointsSemester;
    const totalSksAll = prevSks + totalSksSemester;
    const ipkTotal = totalSksAll === 0 ? 0 : totalPointsAll / totalSksAll;

    const maxSks = getMaxSks(ipSemester);

    setResults({
      ipSemester: ipSemester.toFixed(2),
      ipkTotal: ipkTotal.toFixed(2),
      maxSks: maxSks,
    });
  };


  const handlePreviousDataChange = (field, value) => {
    setPreviousData((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddCourse = () => {
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    setCourses([...courses, { id: newId, name: '', sks: '3', grade: 'A' }]);
  };

  const handleRemoveCourse = (id) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const handleCourseChange = (id, field, value) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const handleReset = () => {
    setPreviousData({ ipk: '0', sks: '0' });
    setCourses([{ id: 1, name: '', sks: '3', grade: 'A' }]);
  };

  
  return (
    <div className="app-container">
      <h1>Kalkulator IPK & SKS</h1>

      <div className="previous-data-form">
        <div className="form-group">
          <label htmlFor="prev-ipk">IPK Kumulatif (Sebelumnya)</label>
          <input
            id="prev-ipk"
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={previousData.ipk}
            onChange={(e) => handlePreviousDataChange('ipk', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="prev-sks">Total SKS Lulus (Sebelumnya)</label>
          <input
            id="prev-sks"
            type="number"
            min="0"
            value={previousData.sks}
            onChange={(e) => handlePreviousDataChange('sks', e.target.value)}
          />
        </div>
      </div>

      <div className="course-labels">
        <label>Mata Kuliah</label>
        <label className="label-sks">SKS</label>
        <label className="label-nilai">Nilai</label>
      </div>

      <div className="course-list">
        <AnimatePresence>
          {courses.map((course) => (
            <motion.div
              key={course.id}
              className="course-item"
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="text"
                placeholder="Nama Mata Kuliah"
                value={course.name}
                onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
              />
              <select
                value={course.sks}
                onChange={(e) => handleCourseChange(course.id, 'sks', e.target.value)}
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
              
              <select
                value={course.grade}
                onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)}
              >
                <option value="A">A (4.0)</option>
                <option value="A-">A- (3.7)</option>
                <option value="B+">B+ (3.3)</option>
                <option value="B">B (3.0)</option>
                <option value="B-">B- (2.7)</option>
                <option value="C+">C+ (2.3)</option>
                <option value="C">C (2.0)</option>
                <option value="C-">C- (1.7)</option>
                <option value="D">D (1.0)</option>
                <option value="E">E (0.0)</option>
              </select>

              <button
                className="delete-btn"
                onClick={() => handleRemoveCourse(course.id)}
              >
                <FaTrash />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="actions">
        <button className="reset-btn" onClick={handleReset}>
          <FaSyncAlt style={{ marginRight: '8px' }} /> Reset
        </button>
        <button className="add-btn" onClick={handleAddCourse}>
          + Tambah Mata Kuliah
        </button>
      </div>

      <div className="results">
        <h2>Hasil Kalkulasi</h2>
        <div className="results-grid">
          <div className="result-item">
            <p>IP Semester Ini</p>
            <span className="ipk-semester-value">{results.ipSemester}</span>
          </div>
          <div className="result-item">
            <p>IPK Total (Kumulatif)</p>
            <span className="ipk-total-value">{results.ipkTotal}</span>
          </div>
          <div className="result-item">
            <p>SKS Maks Semester Depan</p>
            <span className="sks-value">{results.maxSks} SKS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;