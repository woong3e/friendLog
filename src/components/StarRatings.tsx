import supabase from '../utils/supabase';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const StarRatings = () => {
  const { id } = useParams();
  const post_id = parseInt(id as string);
  const [avg, setAvg] = useState<number | null>(null);
  const [chartData, setChartData] = useState<number[]>(Array(10).fill(0));

  useEffect(() => {
    const fetchRating = async () => {
      if (!post_id) return;
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('post_id', post_id);

      if (!error && data.length > 0) {
        const avgRating =
          data.reduce((acc, cur) => acc + cur.rating, 0) / data.length;
        setAvg(avgRating);

        const counts = Array(10).fill(0);
        data.forEach((item) => {
          const index = item.rating * 2 - 1;
          if (index >= 0 && index < 10) {
            counts[index] += 1;
          }
        });
        setChartData(counts);
      } else {
        setAvg(null);
        setChartData(Array(10).fill(0));
      }
    };
    fetchRating();
  }, [post_id]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        '0.5',
        '1.0',
        '1.5',
        '2.0',
        '2.5',
        '3.0',
        '3.5',
        '4.0',
        '4.5',
        '5.0',
      ],
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      title: {
        text: '평점',
        style: {
          color: '#9ca3af',
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
        formatter: (val) => val.toFixed(0),
      },
      title: {
        text: '인원',
        rotate: 0,
        offsetX: 10,
        style: {
          color: '#9ca3af',
        },
      },
    },
    grid: {
      show: false,
      padding: {
        left: 40,
        right: 20,
      },
    },
    colors: ['#FDD56A'],
    tooltip: {
      theme: 'dark',
    },
  };

  const series = [
    {
      name: '참여자 수',
      data: chartData,
    },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-row justify-center mb-6">
        <img
          src="https://fdngliaptbsfvxvygvgi.supabase.co/storage/v1/object/public/friendlog/public-assets/left-laurel-wreath.png"
          alt="left-laurel-wreath"
          className="w-20 h-30"
        />
        <p className="flex items-center text-black text-7xl dark:text-white mx-4">
          {avg?.toFixed(2) || '0.00'}
        </p>
        <img
          src="https://fdngliaptbsfvxvygvgi.supabase.co/storage/v1/object/public/friendlog/public-assets/right-laurel-wreath.png"
          alt="right-laurel-wreath"
          className="w-20 h-30"
        />
      </div>
        <div className="w-full max-w-2xl px-4">
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height={250}
          />
        </div>
    </div>
  );
};

export default StarRatings;
